package com.gautham.selfcheckinsystem.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TotpUtilTest {

    @Test
    void testTotpGenerationAndValidation_Success() {
        Long participantId = 1001L;
        long timeStep = TotpUtil.getCurrentTimeStep();

        String token = TotpUtil.generateTotpToken(participantId, timeStep);

        assertNotNull(token);
        assertEquals(8, token.length());
        assertTrue(TotpUtil.validateTotpToken(participantId, timeStep, token));
    }

    @Test
    void testTotpValidation_ExpiredTimeStep_Fails() {
        Long participantId = 1001L;
        long currentTimeStep = TotpUtil.getCurrentTimeStep();
        long expiredTimeStep = currentTimeStep - 5; // 5 steps ago (~2.5 minutes ago)

        String token = TotpUtil.generateTotpToken(participantId, expiredTimeStep);

        assertFalse(TotpUtil.validateTotpToken(participantId, expiredTimeStep, token));
    }

    @Test
    void testTotpValidation_TamperedToken_Fails() {
        Long participantId = 1001L;
        long timeStep = TotpUtil.getCurrentTimeStep();

        assertFalse(TotpUtil.validateTotpToken(participantId, timeStep, "invalid123"));
    }
}
