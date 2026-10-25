package com.chapterandco.dto;

public record AuthResponse(String token, String userId, String email, String name) {}
