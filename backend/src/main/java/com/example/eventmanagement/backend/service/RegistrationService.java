package com.example.eventmanagement.backend.service;

import com.example.eventmanagement.backend.entity.Event;
import com.example.eventmanagement.backend.entity.Registration;
import com.example.eventmanagement.backend.entity.User;
import com.example.eventmanagement.backend.repository.EventRepository;
import com.example.eventmanagement.backend.repository.RegistrationRepository;
import com.example.eventmanagement.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            EventRepository eventRepository) {

        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    public Registration registerStudent(
            String email, Long eventId) {

        User student = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found"));

        if (registrationRepository
                .existsByStudentAndEvent(student, event)) {

            throw new RuntimeException(
                    "Already registered for this event");
        }

        List<Registration> registrations =
                registrationRepository.findByEvent(event);

        if (registrations.size() >= event.getCapacity()) {
            throw new RuntimeException("Event is full");
        }

        Registration registration =
                new Registration(student, event);

        return registrationRepository.save(registration);
    }

    public List<Registration> getMyRegistrations(
            String email) {

        User student = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        return registrationRepository.findByStudent(student);
    }

    public List<Registration> getEventRegistrations(
            Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new RuntimeException("Event not found"));

        return registrationRepository.findByEvent(event);
    }
}