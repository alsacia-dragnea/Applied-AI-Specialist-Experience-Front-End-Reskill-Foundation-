package com.chapterandco.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JwtTokenProvider unit tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setup() {
        // Must be >= 256 bits (32 chars) for HS256
        jwtTokenProvider = new JwtTokenProvider(
                "test-secret-key-for-unit-tests-only-256bits-padding00",
                86400000L);
    }

    @Test
    @DisplayName("generateToken — produces non-null token")
    void generateToken_notNull() {
        String token = jwtTokenProvider.generateToken("user-1", "user@test.com");
        assertThat(token).isNotBlank();
    }

    @Test
    @DisplayName("validateToken — returns true for valid token")
    void validateToken_valid() {
        String token = jwtTokenProvider.generateToken("user-1", "user@test.com");
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
    }

    @Test
    @DisplayName("validateToken — returns false for tampered token")
    void validateToken_tampered() {
        String token = jwtTokenProvider.generateToken("user-1", "user@test.com") + "tampered";
        assertThat(jwtTokenProvider.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("validateToken — returns false for empty string")
    void validateToken_empty() {
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
    }

    @Test
    @DisplayName("getUserIdFromToken — extracts correct userId")
    void getUserIdFromToken() {
        String token = jwtTokenProvider.generateToken("user-42", "user@test.com");
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo("user-42");
    }

    @Test
    @DisplayName("getEmailFromToken — extracts correct email")
    void getEmailFromToken() {
        String token = jwtTokenProvider.generateToken("user-1", "alice@test.com");
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("alice@test.com");
    }
}
