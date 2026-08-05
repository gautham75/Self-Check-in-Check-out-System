package com.gautham.selfcheckinsystem.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "testsender@gmail.com");
    }

    @Test
    void testSendRegistrationEmail_Success() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendRegistrationEmail("user@example.com", "John Doe", "http://localhost:8080/qr/1");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendCertificateEmail_Success() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendCertificateEmail("user@example.com", "John Doe", "Tech Summit 2026", "http://localhost:8080/cert/1");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendRegistrationEmail_SkippedWhenNoFromEmail() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "");

        emailService.sendRegistrationEmail("user@example.com", "John Doe", "http://localhost:8080/qr/1");

        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
