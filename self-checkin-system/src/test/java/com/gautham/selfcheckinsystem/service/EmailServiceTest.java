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
import org.springframework.mail.javamail.MimeMessageHelper;
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
    void testSendRegistrationEmail_FallbackFromEmail() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        ReflectionTestUtils.setField(emailService, "fromEmail", "");

        emailService.sendRegistrationEmail("user@example.com", "John Doe", "http://localhost:8080/qr/1");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testLiveGmailSmtpDispatch() {
        try {
            org.springframework.mail.javamail.JavaMailSenderImpl sender = new org.springframework.mail.javamail.JavaMailSenderImpl();
            sender.setHost("smtp.gmail.com");
            sender.setPort(465);
            sender.setUsername("gmj.creation.77@gmail.com");
            sender.setPassword("ducqrdwihghgnavq");

            java.util.Properties props = sender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtps");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");

            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("gmj.creation.77@gmail.com", "EventSync Platform");
            helper.setTo("gauthammanoj136@gmail.com");
            helper.setSubject("EventSync Live Test Email");
            helper.setText("Hello Gautham! If you receive this, Gmail SMTP authentication is 100% working!", false);

            sender.send(message);
            System.out.println("LIVE SMTP TEST: Email sent successfully to gauthammanoj136@gmail.com!");
        } catch (Exception e) {
            System.err.println("LIVE SMTP TEST FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
