package com.gautham.selfcheckinsystem.dto;

public class DashboardDTO {

    private long totalEvents;
    private long totalParticipants;
    private long checkedIn;
    private long checkedOut;
    private long currentlyInside;
    private long certificatesGenerated;

    public DashboardDTO() {
    }

    public DashboardDTO(long totalEvents,
                        long totalParticipants,
                        long checkedIn,
                        long checkedOut,
                        long currentlyInside,
                        long certificatesGenerated) {
        this.totalEvents = totalEvents;
        this.totalParticipants = totalParticipants;
        this.checkedIn = checkedIn;
        this.checkedOut = checkedOut;
        this.currentlyInside = currentlyInside;
        this.certificatesGenerated = certificatesGenerated;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
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

    public long getCurrentlyInside() {
        return currentlyInside;
    }

    public void setCurrentlyInside(long currentlyInside) {
        this.currentlyInside = currentlyInside;
    }

    public long getCertificatesGenerated() {
        return certificatesGenerated;
    }

    public void setCertificatesGenerated(long certificatesGenerated) {
        this.certificatesGenerated = certificatesGenerated;
    }
}