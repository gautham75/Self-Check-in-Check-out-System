package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.dto.ParticipantDTO;
import com.gautham.selfcheckinsystem.entity.Event;
import com.gautham.selfcheckinsystem.entity.Participant;
import com.gautham.selfcheckinsystem.exception.DuplicateResourceException;
import com.gautham.selfcheckinsystem.exception.ResourceNotFoundException;
import com.gautham.selfcheckinsystem.repository.EventRepository;
import com.gautham.selfcheckinsystem.repository.ParticipantRepository;
import com.gautham.selfcheckinsystem.util.QRCodeGenerator;
import com.gautham.selfcheckinsystem.util.QRCodeReaderUtil;
import com.gautham.selfcheckinsystem.util.TotpUtil;
import com.google.zxing.WriterException;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final S3Service s3Service;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @org.springframework.beans.factory.annotation.Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    public ParticipantService(
            ParticipantRepository participantRepository,
            EventRepository eventRepository,
            S3Service s3Service,
            EmailService emailService) {

        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
        this.s3Service = s3Service;
        this.emailService = emailService;
    }

    public List<Participant> getAllParticipants() {
        List<Participant> participants = participantRepository.findAll();
        for (Participant p : participants) {
            ensureQrCodeUrl(p);
            ensureCertificateUrl(p);
        }
        return participants;
    }

    public Participant getParticipantById(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Participant not found with ID: " + id));
        ensureQrCodeUrl(participant);
        ensureCertificateUrl(participant);
        return participant;
    }

    private void ensureQrCodeUrl(Participant p) {
        String directQrUrl = "http://localhost:8080/api/participants/qrcode/" + p.getId();
        if (p.getQrCodeUrl() == null || !p.getQrCodeUrl().equals(directQrUrl)) {
            p.setQrCodeUrl(directQrUrl);
            participantRepository.save(p);
        }
    }

    private void ensureCertificateUrl(Participant p) {
        if (p.getCertificateUrl() != null && p.getCertificateUrl().contains("s3.eu-north-1.amazonaws.com")) {
            p.setCertificateUrl("http://localhost:8080/api/certificate/view/" + p.getId());
            participantRepository.save(p);
        }
    }

    public String generateDynamicPassPayload(Participant participant) {
        long currentStep = TotpUtil.getCurrentTimeStep();
        String token = TotpUtil.generateTotpToken(participant.getId(), currentStep);
        return String.format(
                "{\"type\":\"DYNAMIC_PASS\",\"id\":%d,\"step\":%d,\"token\":\"%s\",\"name\":\"%s\",\"reg\":\"%s\"}",
                participant.getId(),
                currentStep,
                token,
                participant.getFullName() != null ? participant.getFullName().replace("\"", "\\\"") : "",
                participant.getRegistrationNumber() != null ? participant.getRegistrationNumber().replace("\"", "\\\"") : ""
        );
    }

    public String generateQrCodeForParticipant(Participant participant) {
        String fileName = "participant_" + participant.getId();
        String eventName = participant.getEvent() != null ? participant.getEvent().getEventName() : "EventSync Event";

        String qrPayload = generateDynamicPassPayload(participant);

        try {
            QRCodeGenerator.generateQRCode(qrPayload, fileName);
            String filePath = "qrcodes/" + fileName + ".png";
            try {
                s3Service.uploadFile(filePath);
            } catch (Exception s3Ex) {
                System.err.println("S3 Upload notice for QR code: " + s3Ex.getMessage());
            }
        } catch (Exception e) {
            System.err.println("Failed to generate rich QR code for participant " + participant.getId() + ": " + e.getMessage());
        }

        String base = (backendUrl != null && !backendUrl.isBlank()) ? backendUrl.trim() : "http://localhost:8080";
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + "/api/participants/qrcode/" + participant.getId();
    }

    public Participant scanQRCode(String input) throws Exception {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Scan input cannot be empty.");
        }
        String cleanInput = input.trim();

        // 1. If input is a local image file path, attempt QR code decoding
        File file = new File(cleanInput);
        if (file.exists() && file.isFile()) {
            try {
                String qrText = QRCodeReaderUtil.readQRCode(cleanInput);
                if (qrText != null && !qrText.isEmpty()) {
                    cleanInput = qrText.trim();
                }
            } catch (Exception e) {
                System.err.println("QR image decode notice: " + e.getMessage());
            }
        }

        // 2. Check for TOTP Dynamic Security Pass JSON
        if (cleanInput.contains("\"DYNAMIC_PASS\"") || cleanInput.contains("DYNAMIC_PASS")) {
            try {
                Long id = null;
                Long step = null;
                String token = null;

                for (String part : cleanInput.replaceAll("[{}\"]", "").split(",")) {
                    String[] kv = part.split(":");
                    if (kv.length >= 2) {
                        String key = kv[0].trim();
                        String val = kv[1].trim();
                        if ("id".equalsIgnoreCase(key)) id = Long.parseLong(val);
                        if ("step".equalsIgnoreCase(key)) step = Long.parseLong(val);
                        if ("token".equalsIgnoreCase(key)) token = val;
                    }
                }

                if (id != null && step != null && token != null) {
                    boolean isValid = TotpUtil.validateTotpToken(id, step, token);
                    if (!isValid) {
                        long currentStep = TotpUtil.getCurrentTimeStep();
                        if (Math.abs(currentStep - step) > 1) {
                            throw new IllegalArgumentException("EXPIRED_QR_PASS: This QR code pass has expired (screenshots/forwarded passes are rejected). Please refresh the pass on your mobile device.");
                        } else {
                            throw new IllegalArgumentException("INVALID_QR_PASS: Tampered or invalid security token.");
                        }
                    }
                    return checkInParticipant(id);
                }
            } catch (IllegalArgumentException ex) {
                throw ex;
            } catch (Exception parseEx) {
                System.err.println("Dynamic QR parse error: " + parseEx.getMessage());
            }
        }

        if (cleanInput.contains("Participant ID:")) {
            for (String line : cleanInput.split("\n")) {
                if (line.contains("Participant ID:")) {
                    cleanInput = line.replace("Participant ID:", "").trim();
                    break;
                }
            }
        } else if (cleanInput.contains("Reg No:")) {
            for (String line : cleanInput.split("\n")) {
                if (line.contains("Reg No:")) {
                    cleanInput = line.replace("Reg No:", "").trim();
                    break;
                }
            }
        }

        // 3. Try numeric Participant ID lookup
        try {
            Long id = Long.parseLong(cleanInput);
            return checkInParticipant(id);
        } catch (NumberFormatException ignored) {}

        // 4. Try exact Registration Number lookup
        Participant pByReg = participantRepository.findByRegistrationNumber(cleanInput)
                .orElse(null);
        if (pByReg != null) {
            return checkInParticipant(pByReg.getId());
        }

        // 5. Try case-insensitive registration number search
        List<Participant> regList = participantRepository.findByRegistrationNumberContainingIgnoreCase(cleanInput);
        if (!regList.isEmpty()) {
            return checkInParticipant(regList.get(0).getId());
        }

        // 6. Try email search
        List<Participant> emailList = participantRepository.findByEmailContainingIgnoreCase(cleanInput);
        if (!emailList.isEmpty()) {
            return checkInParticipant(emailList.get(0).getId());
        }

        // 7. Try name search
        List<Participant> nameList = participantRepository.findByFullNameContainingIgnoreCase(cleanInput);
        if (!nameList.isEmpty()) {
            return checkInParticipant(nameList.get(0).getId());
        }

        throw new ResourceNotFoundException("Participant not found for ID, Registration Number, or Email: '" + input + "'");
    }

    public Participant registerParticipant(ParticipantDTO participantDTO) {

        if (participantRepository.existsByEmail(participantDTO.getEmail())) {
            throw new DuplicateResourceException("Participant with email '" + participantDTO.getEmail() + "' already exists.");
        }

        if (participantRepository.existsByRegistrationNumber(participantDTO.getRegistrationNumber())) {
            throw new DuplicateResourceException("Participant with registration number '" + participantDTO.getRegistrationNumber() + "' already exists.");
        }

        Event event = eventRepository.findById(participantDTO.getEventId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Event not found with ID: " + participantDTO.getEventId()));

        Participant participant = new Participant();
        participant.setFullName(participantDTO.getFullName());
        participant.setEmail(participantDTO.getEmail());
        participant.setPhone(participantDTO.getPhone());
        participant.setCollege(participantDTO.getCollege());
        participant.setDepartment(participantDTO.getDepartment());
        participant.setYear(participantDTO.getYear());
        participant.setRegistrationNumber(participantDTO.getRegistrationNumber());
        participant.setEvent(event);

        Participant savedParticipant = participantRepository.save(participant);

        String directQrUrl = generateQrCodeForParticipant(savedParticipant);
        savedParticipant.setQrCodeUrl(directQrUrl);
        savedParticipant = participantRepository.save(savedParticipant);

        try {
            String fBase = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
            if (fBase.endsWith("/")) fBase = fBase.substring(0, fBase.length() - 1);
            String passUrl = fBase + "/pass/" + savedParticipant.getId();
            emailService.sendRegistrationEmail(
                    savedParticipant.getEmail(),
                    savedParticipant.getFullName(),
                    passUrl
            );
        } catch (Exception e) {
            System.err.println("Registration email sending warning: " + e.getMessage());
        }

        return savedParticipant;
    }

    public Participant updateParticipant(Long id, ParticipantDTO participantDTO) {

        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Participant not found with ID: " + id));

        if (!participant.getEmail().equalsIgnoreCase(participantDTO.getEmail()) &&
                participantRepository.existsByEmail(participantDTO.getEmail())) {
            throw new DuplicateResourceException("Participant with email '" + participantDTO.getEmail() + "' already exists.");
        }

        if (!participant.getRegistrationNumber().equalsIgnoreCase(participantDTO.getRegistrationNumber()) &&
                participantRepository.existsByRegistrationNumber(participantDTO.getRegistrationNumber())) {
            throw new DuplicateResourceException("Participant with registration number '" + participantDTO.getRegistrationNumber() + "' already exists.");
        }

        Event event = eventRepository.findById(participantDTO.getEventId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Event not found with ID: " + participantDTO.getEventId()));

        participant.setFullName(participantDTO.getFullName());
        participant.setEmail(participantDTO.getEmail());
        participant.setPhone(participantDTO.getPhone());
        participant.setCollege(participantDTO.getCollege());
        participant.setDepartment(participantDTO.getDepartment());
        participant.setYear(participantDTO.getYear());
        participant.setRegistrationNumber(participantDTO.getRegistrationNumber());
        participant.setEvent(event);

        return participantRepository.save(participant);
    }

    public void deleteParticipant(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Participant not found with ID: " + id));

        participantRepository.delete(participant);
    }

    public Participant checkInParticipant(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Participant not found with ID: " + id));

        if (participant.isCheckedIn()) {
            throw new DuplicateResourceException("Participant '" + participant.getFullName() + "' is already checked in.");
        }
        participant.setCheckedIn(true);
        participant.setCheckInTime(java.time.LocalDateTime.now());

        return participantRepository.save(participant);
    }

    public Participant checkOutParticipant(Long id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Participant not found with ID: " + id));

        if (!participant.isCheckedIn()) {
            throw new IllegalArgumentException("Participant '" + participant.getFullName() + "' has not checked in yet.");
        }

        if (participant.isCheckedOut()) {
            throw new DuplicateResourceException("Participant '" + participant.getFullName() + "' is already checked out.");
        }

        participant.setCheckedOut(true);
        participant.setCheckOutTime(java.time.LocalDateTime.now());

        long duration = java.time.Duration.between(
                        participant.getCheckInTime(),
                        participant.getCheckOutTime())
                .toMinutes();

        participant.setDurationMinutes(duration);

        return participantRepository.save(participant);
    }

    public List<Participant> searchByName(String name) {
        return participantRepository.findByFullNameContainingIgnoreCase(name);
    }

    public List<Participant> searchByRegistrationNumber(String registrationNumber) {
        return participantRepository.findByRegistrationNumberContainingIgnoreCase(registrationNumber);
    }

    public List<Participant> searchByEmail(String email) {
        return participantRepository.findByEmailContainingIgnoreCase(email);
    }
}