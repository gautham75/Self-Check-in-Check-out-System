package com.gautham.selfcheckinsystem.controller;

import com.gautham.selfcheckinsystem.dto.AttendanceReportDTO;
import com.gautham.selfcheckinsystem.dto.EventReportDTO;
import com.gautham.selfcheckinsystem.dto.StatisticsDTO;
import com.gautham.selfcheckinsystem.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceReportDTO>> getAttendanceReport() {
        return ResponseEntity.ok(reportService.getAttendanceReport());
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<EventReportDTO> getEventReport(@PathVariable Long eventId) {
        return ResponseEntity.ok(reportService.getEventReport(eventId));
    }

    @GetMapping("/statistics")
    public ResponseEntity<StatisticsDTO> getStatistics() {
        return ResponseEntity.ok(reportService.getStatistics());
    }

    @GetMapping("/attendance/export/pdf")
    public ResponseEntity<byte[]> exportAttendancePDF() throws Exception {
        byte[] pdf = reportService.exportAttendanceReportToPDF();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/attendance/export/excel")
    public ResponseEntity<byte[]> exportAttendanceExcel() throws Exception {
        byte[] excel = reportService.exportAttendanceReportToExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @GetMapping("/event/{eventId}/export/pdf")
    public ResponseEntity<byte[]> exportEventPDF(@PathVariable Long eventId) throws Exception {
        byte[] pdf = reportService.exportEventReportToPDF(eventId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=event_report_" + eventId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/event/{eventId}/export/excel")
    public ResponseEntity<byte[]> exportEventExcel(@PathVariable Long eventId) throws Exception {
        byte[] excel = reportService.exportEventReportToExcel(eventId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=event_report_" + eventId + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @GetMapping("/csv")
    public ResponseEntity<String> exportCSV() {
        String csv = reportService.exportParticipantsToCSV();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=participants.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPDF() throws Exception {
        byte[] pdf = reportService.exportParticipantsToPDF();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=participants.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}