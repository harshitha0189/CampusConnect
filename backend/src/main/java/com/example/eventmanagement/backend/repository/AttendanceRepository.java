package com.example.eventmanagement.backend.repository;

import com.example.eventmanagement.backend.entity.Attendance;
import com.example.eventmanagement.backend.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByRegistration(
            Registration registration
    );

    List<Attendance> findByRegistrationEventId(
            Long eventId
    );
}