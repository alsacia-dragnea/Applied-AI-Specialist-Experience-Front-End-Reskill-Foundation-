package com.chapterandco.controller;

import com.chapterandco.config.SecurityConfig;
import com.chapterandco.dto.LoginRequest;
import com.chapterandco.dto.RegisterRequest;
import com.chapterandco.dto.AuthResponse;
import com.chapterandco.exception.BusinessRuleException;
import com.chapterandco.repository.UserRepository;
import com.chapterandco.security.JwtAuthenticationFilter;
import com.chapterandco.security.JwtTokenProvider;
import com.chapterandco.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@DisplayName("AuthController API tests")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean UserRepository userRepository;

    @Test
    @DisplayName("POST /api/v1/auth/register — 201 Created with token")
    void register_returns201() throws Exception {
        when(authService.register(any())).thenReturn(
                new AuthResponse("jwt-token", "user-1", "alice@test.com", "Alice"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new RegisterRequest("Alice", "alice@test.com", "password123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("alice@test.com"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register — 422 for invalid email")
    void register_invalidEmail_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Alice\",\"email\":\"not-an-email\",\"password\":\"password123\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register — 422 for short password")
    void register_shortPassword_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Alice\",\"email\":\"alice@test.com\",\"password\":\"abc\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login — 200 OK with token")
    void login_returns200() throws Exception {
        when(authService.login(any())).thenReturn(
                new AuthResponse("jwt-token", "user-1", "demo@chapterandco.com", "Demo"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("demo@chapterandco.com", "Demo1234!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login — 422 for missing body")
    void login_missingBody_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("POST /api/v1/auth/login — 400 for wrong password")
    void login_wrongPassword_returns400() throws Exception {
        when(authService.login(any())).thenThrow(new BusinessRuleException("Invalid email or password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"demo@chapterandco.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }
}
