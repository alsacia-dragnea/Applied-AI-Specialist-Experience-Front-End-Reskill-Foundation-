package com.chapterandco.exception;

import com.chapterandco.config.SecurityConfig;
import com.chapterandco.controller.AuthController;
import com.chapterandco.controller.BookController;
import com.chapterandco.service.AuthService;
import com.chapterandco.repository.UserRepository;
import com.chapterandco.security.JwtAuthenticationFilter;
import com.chapterandco.security.JwtTokenProvider;
import com.chapterandco.service.BookService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({BookController.class, AuthController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@DisplayName("GlobalExceptionHandler status mapping")
class GlobalExceptionHandlerTest {

    @Autowired MockMvc mockMvc;
    @MockBean BookService bookService;
    @MockBean AuthService authService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean UserRepository userRepository;

    @Test
    @DisplayName("wrong HTTP method on an existing route returns 405, not 500")
    void wrongMethodIs405() throws Exception {
        mockMvc.perform(get("/api/v1/auth/login"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.error").value("Method not allowed"));
    }

    @Test
    @DisplayName("unknown route returns 404, not 500")
    void unknownRouteIs404() throws Exception {
        mockMvc.perform(get("/api/v1/books/featured/does/not/exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Resource not found"));
    }
}
