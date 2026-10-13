package com.example.eventmanagement.backend.service;

import com.example.eventmanagement.backend.entity.Event;
import com.example.eventmanagement.backend.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // Create event
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    // Get all events
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Get event by ID
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Event not found"));
    }

    // Update event
    public Event updateEvent(Long id, Event updatedEvent) {

        Event event = getEventById(id);

        event.setTitle(updatedEvent.getTitle());
        event.setDescription(updatedEvent.getDescription());
        event.setVenue(updatedEvent.getVenue());
        event.setDate(updatedEvent.getDate());
        event.setTime(updatedEvent.getTime());
        event.setCapacity(updatedEvent.getCapacity());
        event.setCategory(updatedEvent.getCategory());
        event.setStatus(updatedEvent.getStatus());

        return eventRepository.save(event);
    }

    // Delete event
    public void deleteEvent(Long id) {

        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found");
        }

        eventRepository.deleteById(id);
    }
}