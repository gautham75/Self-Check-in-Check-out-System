package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.entity.OtpVerification;
import com.gautham.selfcheckinsystem.repository.OtpRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpRepository otpRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OtpService otpService;

    @Test
    void testGenerateAndSendOtp_Success() {
        String msg = otpService.generateAndSendOtp("user@example.com", "John Doe");

        assertNotNull(msg);
        verify(otpRepository, times(1)).save(any(OtpVerification.class));
        verify(emailService, times(1)).sendOtpEmail(eq("user@example.com"), eq("John Doe"), anyString());
    }

    @Test
    void testVerifyOtp_ValidCode_Success() {
        String email = "user@example.com";
        String code = "123456";
        OtpVerification otp = new OtpVerification(email, code, LocalDateTime.now().plusMinutes(5));

        when(otpRepository.findTopByEmailOrderByIdDesc(email)).thenReturn(Optional.of(otp));

        boolean verified = otpService.verifyOtp(email, code);

        assertTrue(verified);
        assertTrue(otp.isVerified());
        verify(otpRepository, times(1)).save(otp);
    }

    @Test
    void testVerifyOtp_ExpiredCode_Fails() {
        String email = "user@example.com";
        String code = "123456";
        OtpVerification otp = new OtpVerification(email, code, LocalDateTime.now().minusMinutes(1)); // Expired

        when(otpRepository.findTopByEmailOrderByIdDesc(email)).thenReturn(Optional.of(otp));

        boolean verified = otpService.verifyOtp(email, code);

        assertFalse(verified);
    }
}
