package com.gautham.selfcheckinsystem.controller;

import com.gautham.selfcheckinsystem.dto.ParticipantDTO;
import com.gautham.selfcheckinsystem.entity.Participant;
import com.gautham.selfcheckinsystem.service.ParticipantService;
import com.gautham.selfcheckinsystem.util.QRCodeGenerator;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @GetMapping
    public ResponseEntity<List<Participant>> getAllParticipants() {
        return ResponseEntity.ok(participantService.getAllParticipants());
    }

    @PostMapping
    public ResponseEntity<Participant> registerParticipant(
            @Valid @RequestBody ParticipantDTO participantDTO) {

        Participant participant =
                participantService.registerParticipant(participantDTO);

        return new ResponseEntity<>(participant, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Participant> getParticipantById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                participantService.getParticipantById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteParticipant(
            @PathVariable Long id) {

        participantService.deleteParticipant(id);

        return ResponseEntity.ok("Participant deleted successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Participant> updateParticipant(
            @PathVariable Long id,
            @Valid @RequestBody ParticipantDTO participantDTO) {

        Participant participant =
                participantService.updateParticipant(id, participantDTO);

        return ResponseEntity.ok(participant);
    }

    @PostMapping("/checkin/{id}")
    public ResponseEntity<Map<String, String>> checkInParticipant(@PathVariable Long id) {

        participantService.checkInParticipant(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Check-in Successful");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/scan")
    public ResponseEntity<Participant> scanQRCode(
            @RequestBody Map<String, String> request) throws Exception {

        String filePath = request.get("filePath");

        return ResponseEntity.ok(
                participantService.scanQRCode(filePath)
        );
    }
    @PostMapping("/checkout/{id}")
    public ResponseEntity<Map<String,String>> checkOutParticipant(
            @PathVariable Long id) {

        participantService.checkOutParticipant(id);

        Map<String,String> response = new HashMap<>();

        response.put("message","Check-out Successful");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Participant>> searchParticipants(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String registrationNumber,
            @RequestParam(required = false) String email) {

        if (name != null && !name.trim().isEmpty()) {
            return ResponseEntity.ok(participantService.searchByName(name));
        }
        if (registrationNumber != null && !registrationNumber.trim().isEmpty()) {
            return ResponseEntity.ok(participantService.searchByRegistrationNumber(registrationNumber));
        }
        if (email != null && !email.trim().isEmpty()) {
            return ResponseEntity.ok(participantService.searchByEmail(email));
        }

        return ResponseEntity.ok(participantService.getAllParticipants());
    }

    @GetMapping("/qrcode/{id}")
    public ResponseEntity<Resource> getQRCode(@PathVariable Long id) {
        Participant participant = participantService.getParticipantById(id);
        String fileName = "participant_" + id + ".png";

        try {
            participantService.generateQrCodeForParticipant(participant);
        } catch (Exception e) {
            System.err.println("Failed to generate QR code for participant ID " + id + ": " + e.getMessage());
        }

        File qrFile = new File("qrcodes/" + fileName);
        if (!qrFile.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(qrFile);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @GetMapping("/dynamic-pass/{id}")
    public ResponseEntity<Map<String, Object>> getDynamicPassDetails(@PathVariable Long id) {
        Participant participant = participantService.getParticipantById(id);
        String qrPayload = participantService.generateDynamicPassPayload(participant);
        long currentSec = System.currentTimeMillis() / 1000L;
        long timeStep = currentSec / 30L;
        long secondsRemaining = 30L - (currentSec % 30L);

        Map<String, Object> pass = new HashMap<>();
        pass.put("participant", participant);
        pass.put("qrPayload", qrPayload);
        pass.put("timeStep", timeStep);
        pass.put("secondsRemaining", secondsRemaining);
        return ResponseEntity.ok(pass);
    }

    @GetMapping("/dynamic-qr/{id}")
    public ResponseEntity<Resource> getDynamicQRCode(@PathVariable Long id) {
        Participant participant = participantService.getParticipantById(id);
        String fileName = "dynamic_" + id;
        String qrPayload = participantService.generateDynamicPassPayload(participant);

        try {
            QRCodeGenerator.generateQRCode(qrPayload, fileName);
            File qrFile = new File("qrcodes/" + fileName + ".png");
            if (qrFile.exists()) {
                Resource resource = new FileSystemResource(qrFile);
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                        .body(resource);
            }
        } catch (Exception e) {
            System.err.println("Dynamic QR generation notice: " + e.getMessage());
        }

        return ResponseEntity.notFound().build();
    }
}