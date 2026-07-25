package com.gautham.selfcheckinsystem.dto;

import java.time.LocalDateTime;

public class AttendanceReportDTO {

    private String participantName;
    private String registrationNumber;
    private String eventName;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Long durationMinutes;
    private String attendanceStatus;

    public AttendanceReportDTO() {
    }

    public AttendanceReportDTO(String participantName, String registrationNumber, String eventName,
                               LocalDateTime checkInTime, LocalDateTime checkOutTime,
                               Long durationMinutes, String attendanceStatus) {
        this.participantName = participantName;
        this.registrationNumber = registrationNumber;
        this.eventName = eventName;
        this.checkInTime = checkInTime;
        this.checkOutTime = checkOutTime;
        this.durationMinutes = durationMinutes;
        this.attendanceStatus = attendanceStatus;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDateTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public Long getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Long durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(String attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }
}
