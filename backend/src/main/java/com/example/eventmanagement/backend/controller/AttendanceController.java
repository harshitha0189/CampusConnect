package com.example.eventmanagement.backend.controller;

import com.example.eventmanagement.backend.entity.Attendance;
import com.example.eventmanagement.backend.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    @PostMapping("/mark/{ticketCode}")
    public ResponseEntity<Attendance> markAttendance(
            @PathVariable String ticketCode) {

        return ResponseEntity.ok(
                attendanceService.markAttendance(ticketCode)
        );
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Attendance>> getEventAttendance(
            @PathVariable Long eventId) {

        return ResponseEntity.ok(
                attendanceService.getEventAttendance(eventId)
        );
    }
}