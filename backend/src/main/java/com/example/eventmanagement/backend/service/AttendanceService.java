package com.example.eventmanagement.backend.service;

import com.example.eventmanagement.backend.entity.Attendance;
import com.example.eventmanagement.backend.entity.Registration;
import com.example.eventmanagement.backend.repository.AttendanceRepository;
import com.example.eventmanagement.backend.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final RegistrationRepository registrationRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            RegistrationRepository registrationRepository) {
        this.attendanceRepository = attendanceRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional
    public Attendance markAttendance(String ticketCode) {

        if (ticketCode == null || ticketCode.isBlank()) {
            throw new RuntimeException("Ticket code is required");
        }

        Registration registration = registrationRepository
                .findByTicketCode(ticketCode.trim())
                .orElseThrow(() ->
                        new RuntimeException("Invalid ticket code"));

        if (attendanceRepository
                .findByRegistration(registration)
                .isPresent()) {
            throw new RuntimeException(
                    "Attendance already marked for this ticket");
        }

        return attendanceRepository.save(
                new Attendance(registration));
    }

    public List<Attendance> getEventAttendance(Long eventId) {
        if (eventId == null) {
            throw new RuntimeException("Event ID is required");
        }

        return attendanceRepository
                .findByRegistrationEventId(eventId);
    }
}