package com.gautham.selfcheckinsystem.dto;

public class StatisticsDTO {

    private double averageAttendanceTime;
    private long maxAttendanceTime;
    private long minAttendanceTime;
    private double averageParticipantsPerEvent;

    public StatisticsDTO() {
    }

    public StatisticsDTO(double averageAttendanceTime, long maxAttendanceTime,
                         long minAttendanceTime, double averageParticipantsPerEvent) {
        this.averageAttendanceTime = averageAttendanceTime;
        this.maxAttendanceTime = maxAttendanceTime;
        this.minAttendanceTime = minAttendanceTime;
        this.averageParticipantsPerEvent = averageParticipantsPerEvent;
    }

    public double getAverageAttendanceTime() {
        return averageAttendanceTime;
    }

    public void setAverageAttendanceTime(double averageAttendanceTime) {
        this.averageAttendanceTime = averageAttendanceTime;
    }

    public long getMaxAttendanceTime() {
        return maxAttendanceTime;
    }

    public void setMaxAttendanceTime(long maxAttendanceTime) {
        this.maxAttendanceTime = maxAttendanceTime;
    }

    public long getMinAttendanceTime() {
        return minAttendanceTime;
    }

    public void setMinAttendanceTime(long minAttendanceTime) {
        this.minAttendanceTime = minAttendanceTime;
    }

    public double getAverageParticipantsPerEvent() {
        return averageParticipantsPerEvent;
    }

    public void setAverageParticipantsPerEvent(double averageParticipantsPerEvent) {
        this.averageParticipantsPerEvent = averageParticipantsPerEvent;
    }
}
