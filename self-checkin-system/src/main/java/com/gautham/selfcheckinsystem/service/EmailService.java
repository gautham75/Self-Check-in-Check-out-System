package com.gautham.selfcheckinsystem.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:}")
    private String fromEmail;

    @org.springframework.scheduling.annotation.Async
    public void sendRegistrationEmail(
            String toEmail,
            String participantName,
            String qrUrl) {

        if (mailSender == null) {
            System.out.println("EmailService: JavaMailSender is not configured. Skipping registration email.");
            return;
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            System.out.println("EmailService Notice: spring.mail.username is not set in .env / properties. Skipping registration email dispatch.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = fromEmail.trim();
            try {
                helper.setFrom(sender, "EventSync Platform");
            } catch (Exception ex) {
                helper.setFrom(sender);
            }
            helper.setTo(toEmail);
            helper.setSubject("Registration Confirmed - EventSync Platform");

            String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F3ED; margin: 0; padding: 20px; color: #212227; }
                        .email-container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #E5E7EB; }
                        .email-header { background-color: #212227; padding: 28px 32px; text-align: center; border-bottom: 4px solid #FFD036; }
                        .logo-badge { display: inline-block; background: #FFD036; color: #212227; font-weight: 800; font-size: 14px; padding: 6px 14px; border-radius: 20px; letter-spacing: 1px; margin-bottom: 8px; }
                        .header-title { color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
                        .email-body { padding: 36px 32px; }
                        .welcome-text { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 12px; }
                        .content-text { font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 24px; }
                        .btn-cta { display: inline-block; background-color: #212227; color: #FFD036 !important; font-weight: 700; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 10px; border: 2px solid #FFD036; box-shadow: 0 4px 12px rgba(33,34,39,0.2); }
                        .email-footer { background-color: #F9FAFB; padding: 20px 32px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <div class="logo-badge">EVENTSYNC PLATFORM</div>
                            <h1 class="header-title">Registration Confirmation</h1>
                        </div>
                        <div class="email-body">
                            <div class="welcome-text">Hello %s,</div>
                            <p class="content-text">
                                Your registration has been processed successfully! Your official digital event pass and QR code have been issued. Please keep this email handy for event entry and check-in processing.
                            </p>
                            <div style="text-align: center; margin: 28px 0;">
                                <a href="%s" class="btn-cta" target="_blank">View Digital Event Pass & QR Code</a>
                            </div>
                        </div>
                        <div class="email-footer">
                            &copy; 2026 EventSync Platform • Smart Event Check-In & Attendance Management System
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(participantName, qrUrl != null ? qrUrl : "#");

            helper.setText(htmlBody, true);
            mailSender.send(message);
            System.out.println("Registration HTML email dispatched to: " + toEmail);
        } catch (Exception e) {
            System.err.println("EmailService Notice: Could not send registration email to " + toEmail + ". Error: " + e.getMessage());
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendCertificateEmail(
            String toEmail,
            String participantName,
            String eventName,
            String certificateUrl) {
        sendCertificateEmail(toEmail, participantName, eventName, certificateUrl, null);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendCertificateEmail(
            String toEmail,
            String participantName,
            String eventName,
            String certificateUrl,
            java.io.File attachmentFile) {

        if (mailSender == null) {
            System.out.println("EmailService: JavaMailSender is not configured. Skipping certificate email.");
            return;
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            System.out.println("EmailService Notice: spring.mail.username is not set in .env / properties. Skipping certificate email dispatch.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = fromEmail.trim();
            try {
                helper.setFrom(sender, "EventSync Platform");
            } catch (Exception ex) {
                helper.setFrom(sender);
            }
            helper.setTo(toEmail);
            helper.setSubject("Congratulations! Your Participation Certificate is Ready - EventSync");

            String htmlBody = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F3ED; margin: 0; padding: 20px; color: #212227; }
                        .email-container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #E5E7EB; }
                        .email-header { background-color: #212227; padding: 32px; text-align: center; border-bottom: 4px solid #FFD036; }
                        .logo-badge { display: inline-block; background: #FFD036; color: #212227; font-weight: 800; font-size: 13px; padding: 6px 16px; border-radius: 20px; letter-spacing: 1.5px; margin-bottom: 10px; }
                        .header-title { color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
                        .email-body { padding: 36px 32px; }
                        .welcome-text { font-size: 19px; font-weight: 700; color: #111827; margin-bottom: 12px; }
                        .content-text { font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 24px; }
                        .info-card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #FFD036; border-radius: 10px; padding: 20px; margin-bottom: 28px; }
                        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
                        .info-label { font-weight: 700; color: #64748B; }
                        .info-value { font-weight: 700; color: #1E293B; }
                        .btn-cta { display: inline-block; background-color: #212227; color: #FFD036 !important; font-weight: 800; font-size: 15px; padding: 15px 32px; text-decoration: none; border-radius: 10px; border: 2px solid #FFD036; box-shadow: 0 4px 14px rgba(33,34,39,0.25); text-transform: uppercase; letter-spacing: 0.5px; }
                        .email-footer { background-color: #F9FAFB; padding: 20px 32px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <div class="logo-badge">EVENTSYNC CERTIFICATION</div>
                            <h1 class="header-title">Participation Certificate</h1>
                        </div>
                        <div class="email-body">
                            <div class="welcome-text">Dear %s,</div>
                            <p class="content-text">
                                Congratulations! Thank you for attending and completing all attendance requirements for <strong>%s</strong>.
                            </p>
                            
                            <div class="info-card">
                                <div class="info-row">
                                    <span class="info-label">Recipient:</span>
                                    <span class="info-value">%s</span>
                                </div>
                                <div class="info-row" style="margin-bottom: 0;">
                                    <span class="info-label">Event Title:</span>
                                    <span class="info-value">%s</span>
                                </div>
                            </div>

                            <p class="content-text">
                                Your official verified certificate of completion has been compiled and is ready for download. Click the button below to view or save your high-resolution certificate PDF:
                            </p>

                            <div style="text-align: center; margin: 32px 0;">
                                <a href="%s" class="btn-cta" target="_blank">🎓 Download Official Certificate PDF</a>
                            </div>
                        </div>
                        <div class="email-footer">
                            &copy; 2026 EventSync Platform • Smart Event Check-In & Attendance Management System
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(participantName, eventName, participantName, eventName, certificateUrl);

            helper.setText(htmlBody, true);

            if (attachmentFile != null && attachmentFile.exists()) {
                helper.addAttachment(attachmentFile.getName(), attachmentFile);
            }

            mailSender.send(message);
            System.out.println("Certificate HTML email dispatched to: " + toEmail);
        } catch (Exception e) {
            System.err.println("EmailService Notice: Could not send certificate email to " + toEmail + ". Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}