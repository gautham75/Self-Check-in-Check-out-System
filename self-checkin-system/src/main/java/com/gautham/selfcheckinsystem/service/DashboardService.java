package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.dto.DashboardDTO;
import com.gautham.selfcheckinsystem.repository.EventRepository;
import com.gautham.selfcheckinsystem.repository.ParticipantRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final EventRepository eventRepository;
    private final ParticipantRepository participantRepository;

    public DashboardService(EventRepository eventRepository,
                            ParticipantRepository participantRepository) {
        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
    }

    public DashboardDTO getDashboardData() {
        DashboardDTO dashboard = new DashboardDTO();

        dashboard.setTotalEvents(eventRepository.count());
        dashboard.setTotalParticipants(participantRepository.count());
        dashboard.setCheckedIn(participantRepository.countByCheckedInTrue());
        dashboard.setCheckedOut(participantRepository.countByCheckedOutTrue());
        dashboard.setCurrentlyInside(participantRepository.countByCheckedInTrueAndCheckedOutFalse());
        dashboard.setCertificatesGenerated(participantRepository.countByCertificateUrlIsNotNull());

        return dashboard;
    }
}