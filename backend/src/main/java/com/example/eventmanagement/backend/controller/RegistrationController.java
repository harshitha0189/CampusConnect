package com.example.eventmanagement.backend.controller;

import com.example.eventmanagement.backend.entity.Registration;
import com.example.eventmanagement.backend.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(
            RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/event/{eventId}")
    public ResponseEntity<Registration> registerForEvent(
            @PathVariable Long eventId,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();

        return ResponseEntity.ok(
                registrationService.registerStudent(
                        email,
                        eventId
                )
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<Registration>> getMyRegistrations(
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();

        return ResponseEntity.ok(
                registrationService.getMyRegistrations(email)
        );
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Registration>> getEventRegistrations(
            @PathVariable Long eventId) {

        return ResponseEntity.ok(
                registrationService.getEventRegistrations(eventId)
        );
    }
}