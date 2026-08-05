package com.gautham.selfcheckinsystem.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class TotpUtil {

    private static final String SECRET_KEY = "EventSyncSuperSecretTOTPKey2026SecureAntiProxySignature";
    private static final int TIME_STEP_SECONDS = 30;

    public static long getCurrentTimeStep() {
        return System.currentTimeMillis() / 1000L / TIME_STEP_SECONDS;
    }

    public static String generateTotpToken(Long participantId, long timeStep) {
        String data = participantId + ":" + timeStep;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            // Convert first 4 bytes to an 8-character hex string
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                String hex = Integer.toHexString(0xff & hash[i]);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to generate TOTP token", e);
        }
    }

    public static boolean validateTotpToken(Long participantId, long scannedStep, String scannedToken) {
        long currentStep = getCurrentTimeStep();
        
        // Allow a 1-step window (±30s) to account for clock skew or scan edge cases
        if (Math.abs(currentStep - scannedStep) > 1) {
            return false;
        }

        String expectedToken = generateTotpToken(participantId, scannedStep);
        return expectedToken.equalsIgnoreCase(scannedToken);
    }
}
