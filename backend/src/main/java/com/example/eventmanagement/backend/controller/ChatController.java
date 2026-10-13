
package com.example.eventmanagement.backend.controller;

import com.example.eventmanagement.backend.service.ChatService;
import com.example.eventmanagement.backend.service.ChatServiceException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    public record ChatRequest(String message) {}

    public record ChatResponse(String answer) {}

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody(required = false) ChatRequest request) {

        if (request == null
                || request.message() == null
                || request.message().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ChatResponse(
                            "Please enter a question."));
        }

        if (request.message().length() > 2000) {
            return ResponseEntity.badRequest()
                    .body(new ChatResponse(
                            "Please keep your question under 2000 characters."));
        }

        try {
            String answer = chatService.ask(request.message().trim());
            return ResponseEntity.ok(new ChatResponse(answer));
        } catch (ChatServiceException exception) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ChatResponse(exception.getMessage()));
        }

    }
}
