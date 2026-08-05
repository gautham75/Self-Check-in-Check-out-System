package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.dto.CertificateResponseDTO;
import com.gautham.selfcheckinsystem.entity.Participant;
import com.gautham.selfcheckinsystem.exception.ResourceNotFoundException;
import com.gautham.selfcheckinsystem.repository.ParticipantRepository;
import com.gautham.selfcheckinsystem.util.CertificateGeneratorUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;

@Service
public class CertificateService {

    private final ParticipantRepository participantRepository;
    private final S3Service s3Service;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    public CertificateService(
            ParticipantRepository participantRepository,
            S3Service s3Service,
            EmailService emailService) {
        this.participantRepository = participantRepository;
        this.s3Service = s3Service;
        this.emailService = emailService;
    }

    @Transactional
    public CertificateResponseDTO generateCertificate(Long participantId) {

        // 1. Fetch participant & verify existence
        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found with ID: " + participantId));

        // 2. Verify check-in (If not checked-in, automatically check in)
        if (!participant.isCheckedIn()) {
            participant.setCheckedIn(true);
            participant.setCheckInTime(java.time.LocalDateTime.now());
        }

        // 3. If not checked-out, automatically record check-out time for certificate completeness
        if (!participant.isCheckedOut()) {
            participant.setCheckedOut(true);
            participant.setCheckOutTime(java.time.LocalDateTime.now());
            if (participant.getCheckInTime() != null) {
                long duration = java.time.Duration.between(
                        participant.getCheckInTime(),
                        participant.getCheckOutTime()
                ).toMinutes();
                participant.setDurationMinutes(duration > 0 ? duration : 30L);
            }
        }

        File tempCertificateFile = null;
        try {
            // 4. Generate PDF certificate temporarily
            String tempDir = "certificates";
            tempCertificateFile = CertificateGeneratorUtil.generateCertificate(participant, tempDir);

            // 5. Upload PDF to AWS S3 (Cloud Storage Backup)
            try {
                s3Service.uploadFile(tempCertificateFile.getAbsolutePath());
                System.out.println("Certificate PDF successfully uploaded to AWS S3 for participant ID: " + participant.getId());
            } catch (Exception s3Ex) {
                System.err.println("S3 Upload notice: " + s3Ex.getMessage());
            }

            // 6. Direct backend view URL guarantees 100% successful opening without AWS S3 AccessDenied errors
            String base = (backendUrl != null && !backendUrl.isBlank()) ? backendUrl.trim() : "http://localhost:8080";
            if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
            String certificateUrl = base + "/api/certificate/view/" + participant.getId();

            // 7. Save certificateUrl into PostgreSQL
            participant.setCertificateUrl(certificateUrl);
            participantRepository.save(participant);

            // 8. Email rich HTML certificate template + PDF attachment to participant
            try {
                String eventName = participant.getEvent() != null ? participant.getEvent().getEventName() : "EventSync Event";
                emailService.sendCertificateEmail(
                        participant.getEmail(),
                        participant.getFullName(),
                        eventName,
                        certificateUrl,
                        tempCertificateFile
                );
            } catch (Exception emailEx) {
                System.err.println("Certificate email warning: " + emailEx.getMessage());
                emailEx.printStackTrace();
            }

            // 9. Return response DTO
            return new CertificateResponseDTO("Certificate Generated Successfully", certificateUrl);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate and process certificate: " + e.getMessage(), e);
        }
    }
}
