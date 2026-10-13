package com.example.eventmanagement.backend.controller;

import com.example.eventmanagement.backend.service.ChatService;
import com.example.eventmanagement.backend.service.ChatServiceException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatService chatService;

    @InjectMocks
    private ChatController chatController;

    @Test
    void rejectsBlankMessages() {
        var response = chatController.chat(
                new ChatController.ChatRequest("  "));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(chatService);
    }

    @Test
    void rejectsMessagesLongerThanTwoThousandCharacters() {
        var response = chatController.chat(
                new ChatController.ChatRequest("a".repeat(2001)));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verifyNoInteractions(chatService);
    }

    @Test
    void returnsTheAssistantAnswer() {
        when(chatService.ask("What events are coming up?"))
                .thenReturn("Check the events page for current listings.");

        var response = chatController.chat(
                new ChatController.ChatRequest(" What events are coming up? "));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().answer())
                .isEqualTo("Check the events page for current listings.");
        verify(chatService).ask("What events are coming up?");
    }

    @Test
    void returnsServiceUnavailableForUnavailableAssistant() {
        when(chatService.ask("Question"))
                .thenThrow(new ChatServiceException("Try again later."));

        var response = chatController.chat(
                new ChatController.ChatRequest("Question"));

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody().answer()).isEqualTo("Try again later.");
    }
}