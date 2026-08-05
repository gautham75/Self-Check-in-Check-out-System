package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.entity.OtpVerification;
import com.gautham.selfcheckinsystem.repository.OtpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    public OtpService(OtpRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    @Transactional
    public String generateAndSendOtp(String email, String name) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required to send OTP.");
        }
        String cleanEmail = email.trim().toLowerCase();

        // 1. Generate 6-digit random code
        int codeInt = 100000 + random.nextInt(900000);
        String otpCode = String.valueOf(codeInt);

        // 2. Set 5-minute expiration
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        // 3. Save to database
        OtpVerification verification = new OtpVerification(cleanEmail, otpCode, expiresAt);
        otpRepository.save(verification);

        // 4. Dispatch Email OTP
        emailService.sendOtpEmail(cleanEmail, name, otpCode);

        return "OTP sent successfully to " + cleanEmail;
    }

    public boolean verifyOtp(String email, String code) {
        if (email == null || code == null) return false;
        String cleanEmail = email.trim().toLowerCase();
        String cleanCode = code.trim();

        Optional<OtpVerification> optionalOtp = otpRepository.findTopByEmailOrderByIdDesc(cleanEmail);

        if (optionalOtp.isPresent()) {
            OtpVerification otp = optionalOtp.get();
            if (!otp.isVerified() && otp.getExpiresAt().isAfter(LocalDateTime.now())) {
                if (otp.getOtpCode().equals(cleanCode)) {
                    otp.setVerified(true);
                    otpRepository.save(otp);
                    return true;
                }
            }
        }
        return false;
    }
}
