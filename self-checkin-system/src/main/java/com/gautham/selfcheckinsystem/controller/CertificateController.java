package com.gautham.selfcheckinsystem.controller;

import com.gautham.selfcheckinsystem.dto.CertificateResponseDTO;
import com.gautham.selfcheckinsystem.service.CertificateService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/certificate")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping("/{participantId}")
    public ResponseEntity<CertificateResponseDTO> generateCertificate(
            @PathVariable Long participantId) {

        CertificateResponseDTO response = certificateService.generateCertificate(participantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/view/{participantId}")
    public ResponseEntity<Resource> viewCertificate(@PathVariable Long participantId) {
        File certFile = new File("certificates/certificate_" + participantId + ".pdf");
        if (!certFile.exists()) {
            // Generate on demand if missing
            certificateService.generateCertificate(participantId);
            certFile = new File("certificates/certificate_" + participantId + ".pdf");
        }

        if (!certFile.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(certFile);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"certificate_" + participantId + ".pdf\"")
                .body(resource);
    }

    @GetMapping("/download/{participantId}")
    public ResponseEntity<Resource> downloadCertificate(@PathVariable Long participantId) {
        File certFile = new File("certificates/certificate_" + participantId + ".pdf");
        if (!certFile.exists()) {
            certificateService.generateCertificate(participantId);
            certFile = new File("certificates/certificate_" + participantId + ".pdf");
        }

        if (!certFile.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(certFile);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate_" + participantId + ".pdf\"")
                .body(resource);
    }
}
