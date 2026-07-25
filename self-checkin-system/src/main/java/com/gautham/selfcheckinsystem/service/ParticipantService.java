package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.dto.ParticipantDTO;
import com.gautham.selfcheckinsystem.entity.Event;
import com.gautham.selfcheckinsystem.entity.Participant;
import com.gautham.selfcheckinsystem.exception.DuplicateResourceException;
import com.gautham.selfcheckinsystem.exception.ResourceNotFoundException;
import com.gautham.selfcheckinsystem.repository.EventRepository;
import com.gautham.selfcheckinsystem.repository.ParticipantRepository;
import com.gautham.selfcheckinsystem.util.QRCodeGenerator;
import com.google.zxing.WriterException;
import org.springframework.stereotype.Service;
import com.gautham.selfcheckinsystem.util.QRCodeReaderUtil;
import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final S3Service s3Service;
    private final EmailService emailService;

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

    public String generateQrCodeForParticipant(Participant participant) {
        String fileName = "participant_" + participant.getId();
        String eventName = participant.getEvent() != null ? participant.getEvent().getEventName() : "EventSync Event";

        String qrPayload = String.format("""
                EventSync Digital Pass
                ----------------------------------
                Name: %s
                Reg No: %s
                Event: %s
                Department: %s (%s)
                College: %s
                Email: %s
                Participant ID: %d
                """,
                participant.getFullName() != null ? participant.getFullName() : "N/A",
                participant.getRegistrationNumber() != null ? participant.getRegistrationNumber() : "N/A",
                eventName,
                participant.getDepartment() != null ? participant.getDepartment() : "N/A",
                participant.getYear() != null ? participant.getYear() : "N/A",
                participant.getCollege() != null ? participant.getCollege() : "N/A",
                participant.getEmail() != null ? participant.getEmail() : "N/A",
                participant.getId()
        );

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

        return "http://localhost:8080/api/participants/qrcode/" + participant.getId();
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

        // 2. Try numeric Participant ID lookup
        try {
            Long id = Long.parseLong(cleanInput);
            return checkInParticipant(id);
        } catch (NumberFormatException ignored) {}

        // 3. Try exact Registration Number lookup
        Participant pByReg = participantRepository.findByRegistrationNumber(cleanInput)
                .orElse(null);
        if (pByReg != null) {
            return checkInParticipant(pByReg.getId());
        }

        // 4. Try case-insensitive registration number search
        List<Participant> regList = participantRepository.findByRegistrationNumberContainingIgnoreCase(cleanInput);
        if (!regList.isEmpty()) {
            return checkInParticipant(regList.get(0).getId());
        }

        // 5. Try email search
        List<Participant> emailList = participantRepository.findByEmailContainingIgnoreCase(cleanInput);
        if (!emailList.isEmpty()) {
            return checkInParticipant(emailList.get(0).getId());
        }

        // 6. Try name search
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
            emailService.sendRegistrationEmail(
                    savedParticipant.getEmail(),
                    savedParticipant.getFullName(),
                    savedParticipant.getQrCodeUrl()
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