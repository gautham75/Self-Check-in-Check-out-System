package com.gautham.selfcheckinsystem.dto;

public class EventReportDTO {

    private EventDTO eventDetails;
    private long totalParticipants;
    private long checkedIn;
    private long checkedOut;
    private double averageDurationMinutes;
    private long certificatesGenerated;

    public EventReportDTO() {
    }

    public EventReportDTO(EventDTO eventDetails, long totalParticipants, long checkedIn,
                          long checkedOut, double averageDurationMinutes, long certificatesGenerated) {
        this.eventDetails = eventDetails;
        this.totalParticipants = totalParticipants;
        this.checkedIn = checkedIn;
        this.checkedOut = checkedOut;
        this.averageDurationMinutes = averageDurationMinutes;
        this.certificatesGenerated = certificatesGenerated;
    }

    public EventDTO getEventDetails() {
        return eventDetails;
    }

    public void setEventDetails(EventDTO eventDetails) {
        this.eventDetails = eventDetails;
    }

    public long getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(long totalParticipants) {
        this.totalParticipants = totalParticipants;
    }

    public long getCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(long checkedIn) {
        this.checkedIn = checkedIn;
    }

    public long getCheckedOut() {
        return checkedOut;
    }

    public void setCheckedOut(long checkedOut) {
        this.checkedOut = checkedOut;
    }

    public double getAverageDurationMinutes() {
        return averageDurationMinutes;
    }

    public void setAverageDurationMinutes(double averageDurationMinutes) {
        this.averageDurationMinutes = averageDurationMinutes;
    }

    public long getCertificatesGenerated() {
        return certificatesGenerated;
    }

    public void setCertificatesGenerated(long certificatesGenerated) {
        this.certificatesGenerated = certificatesGenerated;
    }
}
