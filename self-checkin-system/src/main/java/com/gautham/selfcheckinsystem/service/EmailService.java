package com.gautham.selfcheckinsystem.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.concurrent.CompletableFuture;
import java.util.Map;
import java.util.List;
import java.util.HashMap;

@Service
public class EmailService {

    private final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @org.springframework.beans.factory.annotation.Value("${brevo.api.key}")
    private String BREVO_API_KEY;

    @org.springframework.beans.factory.annotation.Value("${brevo.from.email:gmj.creation.77@gmail.com}")
    private String FROM_EMAIL;

    private final String FROM_NAME = "EventSync Platform";

    private final RestTemplate restTemplate = new RestTemplate();

    private void sendBrevoEmail(String toEmail, String toName, String subject, String htmlContent) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", BREVO_API_KEY);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            Map<String, Object> sender = new HashMap<>();
            sender.put("name", FROM_NAME);
            sender.put("email", FROM_EMAIL);

            Map<String, Object> to = new HashMap<>();
            to.put("email", toEmail);
            if (toName != null && !toName.isBlank()) {
                to.put("name", toName);
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", sender);
            payload.put("to", List.of(to));
            payload.put("subject", subject);
            payload.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_API_URL, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Brevo API Email dispatched successfully to: " + toEmail);
            } else {
                System.err.println("Brevo API Error: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("EmailService Notice: Could not send email via Brevo to " + toEmail + ". Error: " + e.getMessage());
        }
    }

    public void sendRegistrationEmail(String toEmail, String participantName, String qrUrl) {
        CompletableFuture.runAsync(() -> {
            String subject = "Registration Confirmed - EventSync Platform";
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
                            &copy; 2026 EventSync Platform • Event Attendance & Entry Management
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(participantName, qrUrl != null ? qrUrl : "#");

            sendBrevoEmail(toEmail, participantName, subject, htmlBody);
        });
    }

    public String sendCheckInOtpEmailDirect(String toEmail, String name, String eventName, String otpCode) {
        String subject = "[PIN: " + otpCode + "] EventSync Entry Code for " + (name != null ? name : "Attendee");
        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F3ED; margin: 0; padding: 20px; color: #212227; }
                    .email-container { max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #E5E7EB; }
                    .email-header { background-color: #212227; padding: 24px; text-align: center; border-bottom: 4px solid #FFD036; }
                    .logo-badge { display: inline-block; background: #FFD036; color: #212227; font-weight: 800; font-size: 13px; padding: 4px 12px; border-radius: 20px; letter-spacing: 1px; margin-bottom: 6px; }
                    .header-title { color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0; }
                    .email-body { padding: 32px 24px; text-align: center; }
                    .welcome-text { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px; }
                    .event-name { font-size: 14px; font-weight: 600; color: #4B5563; margin-bottom: 16px; }
                    .otp-box { background-color: #FEF3C7; border: 2px dashed #D97706; border-radius: 12px; padding: 18px; margin: 24px 0; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #92400E; font-family: monospace; }
                    .content-text { font-size: 13px; line-height: 1.5; color: #6B7280; margin-bottom: 12px; }
                    .email-footer { background-color: #F9FAFB; padding: 16px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <div class="logo-badge">EVENT ENTRY VERIFICATION</div>
                        <h1 class="header-title">Check-In Verification Code</h1>
                    </div>
                    <div class="email-body">
                        <div class="welcome-text">Hello %s,</div>
                        <div class="event-name">Event: %s</div>
                        <p class="content-text">You are currently checking in at the venue terminal. Provide the 6-digit PIN below to the event staff to complete your check-in and issue your certificate:</p>
                        <div class="otp-box">%s</div>
                        <p class="content-text">This code is valid for <strong>5 minutes</strong>. If you are not currently at the venue, please report this immediately.</p>
                    </div>
                    <div class="email-footer">
                        &copy; 2026 EventSync Platform • Official Check-In Desk System
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name != null ? name : "Attendee", eventName != null ? eventName : "EventSync Event", otpCode);

        sendBrevoEmail(toEmail, name, subject, htmlBody);
        return "SUCCESS";
    }

    public void sendCheckInOtpEmail(String toEmail, String name, String eventName, String otpCode) {
        CompletableFuture.runAsync(() -> sendCheckInOtpEmailDirect(toEmail, name, eventName, otpCode));
    }

    public void sendOtpEmail(String toEmail, String name, String otpCode) {
        String subject = "[EventSync] Your Verification Code: " + otpCode;
        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F5F3ED; margin: 0; padding: 20px; color: #212227; }
                    .email-container { max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #E5E7EB; }
                    .email-header { background-color: #212227; padding: 24px; text-align: center; border-bottom: 4px solid #FFD036; }
                    .logo-badge { display: inline-block; background: #FFD036; color: #212227; font-weight: 800; font-size: 13px; padding: 4px 12px; border-radius: 20px; letter-spacing: 1px; margin-bottom: 6px; }
                    .header-title { color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0; }
                    .email-body { padding: 32px 24px; text-align: center; }
                    .welcome-text { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 12px; }
                    .otp-box { background-color: #F8FAFC; border: 2px dashed #FFD036; border-radius: 12px; padding: 18px; margin: 24px 0; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #212227; font-family: monospace; }
                    .content-text { font-size: 13px; line-height: 1.5; color: #6B7280; margin-bottom: 12px; }
                    .email-footer { background-color: #F9FAFB; padding: 16px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <div class="logo-badge">EVENTSYNC SECURITY</div>
                        <h1 class="header-title">Email Identity Verification</h1>
                    </div>
                    <div class="email-body">
                        <div class="welcome-text">Hello %s,</div>
                        <p class="content-text">Use the 6-digit OTP code below to verify your email address for EventSync registration. This code is valid for <strong>5 minutes</strong>.</p>
                        <div class="otp-box">%s</div>
                        <p class="content-text">If you did not request this code, please ignore this email.</p>
                    </div>
                    <div class="email-footer">
                        &copy; 2026 EventSync Platform • Secure Event Attendance System
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name != null ? name : "User", otpCode);

        sendBrevoEmail(toEmail, name, subject, htmlBody);
    }

    public void sendCertificateEmail(String toEmail, String participantName, String eventName, String certificateUrl) {
        sendCertificateEmail(toEmail, participantName, eventName, certificateUrl, null);
    }

    public void sendCertificateEmail(String toEmail, String participantName, String eventName, String certificateUrl, java.io.File attachmentFile) {
        String subject = "Congratulations! Your Participation Certificate is Ready - EventSync";
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

        sendBrevoEmail(toEmail, participantName, subject, htmlBody);
    }
}