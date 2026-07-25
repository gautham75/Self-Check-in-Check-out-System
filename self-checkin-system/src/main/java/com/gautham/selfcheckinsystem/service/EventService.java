package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.entity.Event;
import com.gautham.selfcheckinsystem.repository.EventRepository;
import org.springframework.stereotype.Service;
import com.gautham.selfcheckinsystem.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Optional;
import com.gautham.selfcheckinsystem.dto.EventDTO;
@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // Get all events
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Save new event
    public Event saveEvent(EventDTO eventDTO) {

        Event event = new Event();

        event.setEventName(eventDTO.getEventName());
        event.setLocation(eventDTO.getLocation());
        event.setEventDate(eventDTO.getEventDate());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setDescription(eventDTO.getDescription());

        return eventRepository.save(event);
    }

    // Delete event
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    public Event updateEvent(Long id, EventDTO eventDTO) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Event not found"));

        event.setEventName(eventDTO.getEventName());
        event.setLocation(eventDTO.getLocation());
        event.setEventDate(eventDTO.getEventDate());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setDescription(eventDTO.getDescription());

        return eventRepository.save(event);
    }

}