package com.gautham.selfcheckinsystem.controller;

import com.gautham.selfcheckinsystem.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");

        String msg = otpService.generateAndSendOtp(email, name);

        Map<String, String> response = new HashMap<>();
        response.put("message", msg);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        boolean verified = otpService.verifyOtp(email, code);

        Map<String, Object> response = new HashMap<>();
        response.put("verified", verified);
        if (verified) {
            response.put("message", "OTP Verified Successfully!");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Invalid or expired OTP code.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
