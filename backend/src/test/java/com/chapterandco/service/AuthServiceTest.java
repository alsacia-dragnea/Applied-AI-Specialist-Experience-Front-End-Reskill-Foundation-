package com.chapterandco.service;

import com.chapterandco.entity.User;
import com.chapterandco.dto.LoginRequest;
import com.chapterandco.dto.RegisterRequest;
import com.chapterandco.dto.AuthResponse;
import com.chapterandco.exception.BusinessRuleException;
import com.chapterandco.repository.UserRepository;
import com.chapterandco.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService unit tests")
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;
    @InjectMocks AuthService authService;

    private User existingUser;

    @BeforeEach
    void setup() {
        existingUser = User.builder()
                .id("user-1")
                .name("Demo User")
                .email("demo@chapterandco.com")
                .password("$2a$12$hashedpassword")
                .build();
    }

    @Test
    @DisplayName("register — creates user and returns JWT token")
    void register_success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtTokenProvider.generateToken(anyString(), anyString())).thenReturn("jwt-token");

        RegisterRequest req = new RegisterRequest("Alice", "alice@test.com", "password123");
        AuthResponse response = authService.register(req);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("alice@test.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register — throws when email already in use")
    void register_emailAlreadyInUse() {
        when(userRepository.existsByEmail("demo@chapterandco.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("Demo", "demo@chapterandco.com", "password123")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already in use");
    }

    @Test
    @DisplayName("login — returns token for valid credentials")
    void login_success() {
        when(userRepository.findByEmail("demo@chapterandco.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("Demo1234!", "$2a$12$hashedpassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken("user-1", "demo@chapterandco.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest("demo@chapterandco.com", "Demo1234!"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.userId()).isEqualTo("user-1");
    }

    @Test
    @DisplayName("login — throws for wrong password")
    void login_wrongPassword() {
        when(userRepository.findByEmail("demo@chapterandco.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$12$hashedpassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("demo@chapterandco.com", "wrongpassword")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    @DisplayName("login — throws for unknown email")
    void login_unknownEmail() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("unknown@test.com", "password")))
                .isInstanceOf(BusinessRuleException.class);
    }
}
