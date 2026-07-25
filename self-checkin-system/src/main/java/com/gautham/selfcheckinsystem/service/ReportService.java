package com.gautham.selfcheckinsystem.service;

import com.gautham.selfcheckinsystem.dto.*;
import com.gautham.selfcheckinsystem.entity.Event;
import com.gautham.selfcheckinsystem.entity.Participant;
import com.gautham.selfcheckinsystem.exception.ResourceNotFoundException;
import com.gautham.selfcheckinsystem.repository.EventRepository;
import com.gautham.selfcheckinsystem.repository.ParticipantRepository;
import com.gautham.selfcheckinsystem.util.CSVExporter;
import com.gautham.selfcheckinsystem.util.ExcelExporter;
import com.gautham.selfcheckinsystem.util.PDFExporter;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    public ReportService(ParticipantRepository participantRepository, EventRepository eventRepository) {
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
    }

    public List<AttendanceReportDTO> getAttendanceReport() {
        List<Participant> participants = participantRepository.findAll();
        List<AttendanceReportDTO> reportList = new ArrayList<>();

        for (Participant p : participants) {
            String status;
            if (p.isCheckedOut()) {
                status = "Checked Out";
            } else if (p.isCheckedIn()) {
                status = "Checked In (Inside)";
            } else {
                status = "Registered (Absent)";
            }

            String eventName = (p.getEvent() != null) ? p.getEvent().getEventName() : "N/A";

            AttendanceReportDTO dto = new AttendanceReportDTO(
                    p.getFullName(),
                    p.getRegistrationNumber(),
                    eventName,
                    p.getCheckInTime(),
                    p.getCheckOutTime(),
                    p.getDurationMinutes(),
                    status
            );
            reportList.add(dto);
        }
        return reportList;
    }

    public EventReportDTO getEventReport(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        EventDTO eventDTO = new EventDTO(
                event.getId(),
                event.getEventName(),
                event.getLocation(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getDescription()
        );

        long totalParticipants = participantRepository.countByEventId(eventId);
        long checkedIn = participantRepository.countByEventIdAndCheckedInTrue(eventId);
        long checkedOut = participantRepository.countByEventIdAndCheckedOutTrue(eventId);

        Double avgDuration = participantRepository.getAverageDurationByEventId(eventId);
        double averageDurationMinutes = (avgDuration != null) ? avgDuration : 0.0;

        long certificatesGenerated = participantRepository.countByEventIdAndCertificateUrlIsNotNull(eventId);

        return new EventReportDTO(
                eventDTO,
                totalParticipants,
                checkedIn,
                checkedOut,
                averageDurationMinutes,
                certificatesGenerated
        );
    }

    public StatisticsDTO getStatistics() {
        Double avgAttendance = participantRepository.getAverageAttendanceDuration();
        double averageAttendanceTime = (avgAttendance != null) ? avgAttendance : 0.0;

        Long maxAttendance = participantRepository.getMaxAttendanceDuration();
        long maxAttendanceTime = (maxAttendance != null) ? maxAttendance : 0L;

        Long minAttendance = participantRepository.getMinAttendanceDuration();
        long minAttendanceTime = (minAttendance != null) ? minAttendance : 0L;

        Double avgParticipants = eventRepository.getAverageParticipantsPerEvent();
        double averageParticipantsPerEvent = (avgParticipants != null) ? avgParticipants : 0.0;

        return new StatisticsDTO(
                averageAttendanceTime,
                maxAttendanceTime,
                minAttendanceTime,
                averageParticipantsPerEvent
        );
    }

    public byte[] exportAttendanceReportToPDF() throws Exception {
        List<AttendanceReportDTO> reports = getAttendanceReport();
        return PDFExporter.exportAttendanceReport(reports);
    }

    public byte[] exportAttendanceReportToExcel() throws Exception {
        List<AttendanceReportDTO> reports = getAttendanceReport();
        return ExcelExporter.exportAttendanceReport(reports);
    }

    public byte[] exportEventReportToPDF(Long eventId) throws Exception {
        EventReportDTO eventReport = getEventReport(eventId);
        return PDFExporter.exportEventReport(eventReport);
    }

    public byte[] exportEventReportToExcel(Long eventId) throws Exception {
        EventReportDTO eventReport = getEventReport(eventId);
        return ExcelExporter.exportEventReport(eventReport);
    }

    public String exportParticipantsToCSV() {
        List<Participant> participants = participantRepository.findAll();
        return CSVExporter.exportParticipants(participants);
    }

    public byte[] exportParticipantsToPDF() throws Exception {
        List<Participant> participants = participantRepository.findAll();
        return PDFExporter.exportParticipants(participants);
    }
}