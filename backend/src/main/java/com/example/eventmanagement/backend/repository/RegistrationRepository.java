package com.example.eventmanagement.backend.repository;

import com.example.eventmanagement.backend.entity.Registration;
import com.example.eventmanagement.backend.entity.User;
import com.example.eventmanagement.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository
        extends JpaRepository<Registration, Long> {

    boolean existsByStudentAndEvent(User student, Event event);

    List<Registration> findByStudent(User student);

    List<Registration> findByEvent(Event event);

    Optional<Registration> findByTicketCode(String ticketCode);
}