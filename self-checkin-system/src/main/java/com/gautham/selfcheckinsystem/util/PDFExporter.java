package com.gautham.selfcheckinsystem.util;

import com.gautham.selfcheckinsystem.dto.AttendanceReportDTO;
import com.gautham.selfcheckinsystem.dto.EventReportDTO;
import com.gautham.selfcheckinsystem.entity.Participant;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class PDFExporter {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public static byte[] exportParticipants(List<Participant> participants) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("Participants & Attendance Directory", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);

        addHeaderCell(table, "ID");
        addHeaderCell(table, "Name");
        addHeaderCell(table, "Email");
        addHeaderCell(table, "Phone");
        addHeaderCell(table, "Checked In");
        addHeaderCell(table, "Checked Out");
        addHeaderCell(table, "Duration (m)");

        for (Participant participant : participants) {
            table.addCell(participant.getId() != null ? String.valueOf(participant.getId()) : "-");
            table.addCell(participant.getFullName() != null ? participant.getFullName() : "N/A");
            table.addCell(participant.getEmail() != null ? participant.getEmail() : "N/A");
            table.addCell(participant.getPhone() != null ? participant.getPhone() : "N/A");
            table.addCell(participant.isCheckedIn() ? "Yes" : "No");
            table.addCell(participant.isCheckedOut() ? "Yes" : "No");
            table.addCell(participant.getDurationMinutes() != null ? String.valueOf(participant.getDurationMinutes()) : "0");
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public static byte[] exportAttendanceReport(List<AttendanceReportDTO> reports) throws Exception {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph("ATTENDANCE REPORT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(15);
        document.add(title);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 2.5f, 3, 2.5f, 2.5f, 1.8f, 2.5f});

        addHeaderCell(table, "Participant Name");
        addHeaderCell(table, "Registration No");
        addHeaderCell(table, "Event Name");
        addHeaderCell(table, "Check-In");
        addHeaderCell(table, "Check-Out");
        addHeaderCell(table, "Duration (m)");
        addHeaderCell(table, "Status");

        for (AttendanceReportDTO dto : reports) {
            table.addCell(dto.getParticipantName() != null ? dto.getParticipantName() : "N/A");
            table.addCell(dto.getRegistrationNumber() != null ? dto.getRegistrationNumber() : "N/A");
            table.addCell(dto.getEventName() != null ? dto.getEventName() : "N/A");
            table.addCell(dto.getCheckInTime() != null ? dto.getCheckInTime().format(DATE_FORMATTER) : "-");
            table.addCell(dto.getCheckOutTime() != null ? dto.getCheckOutTime().format(DATE_FORMATTER) : "-");
            table.addCell(dto.getDurationMinutes() != null ? String.valueOf(dto.getDurationMinutes()) : "0");
            table.addCell(dto.getAttendanceStatus() != null ? dto.getAttendanceStatus() : "Registered");
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public static byte[] exportEventReport(EventReportDTO dto) throws Exception {
        Document document = new Document(PageSize.A4, 30, 30, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Paragraph title = new Paragraph("EVENT SUMMARY REPORT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(15);
        document.add(title);

        if (dto.getEventDetails() != null) {
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            document.add(new Paragraph("Event Details", sectionFont));
            document.add(new Paragraph("Event Name: " + (dto.getEventDetails().getEventName() != null ? dto.getEventDetails().getEventName() : "N/A")));
            document.add(new Paragraph("Location: " + (dto.getEventDetails().getLocation() != null ? dto.getEventDetails().getLocation() : "N/A")));
            document.add(new Paragraph("Date: " + (dto.getEventDetails().getEventDate() != null ? dto.getEventDetails().getEventDate().toString() : "N/A")));
            document.add(new Paragraph("Time: " + (dto.getEventDetails().getStartTime() != null ? dto.getEventDetails().getStartTime() : "") + " - " + (dto.getEventDetails().getEndTime() != null ? dto.getEventDetails().getEndTime() : "")));
            document.add(new Paragraph(" "));
        }

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(80);
        table.setHorizontalAlignment(Element.ALIGN_CENTER);

        addHeaderCell(table, "Metric");
        addHeaderCell(table, "Value");

        table.addCell("Total Participants");
        table.addCell(String.valueOf(dto.getTotalParticipants()));

        table.addCell("Checked In");
        table.addCell(String.valueOf(dto.getCheckedIn()));

        table.addCell("Checked Out");
        table.addCell(String.valueOf(dto.getCheckedOut()));

        table.addCell("Average Duration (minutes)");
        table.addCell(String.format("%.2f", dto.getAverageDurationMinutes()));

        table.addCell("Certificates Generated");
        table.addCell(String.valueOf(dto.getCertificatesGenerated()));

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    private static void addHeaderCell(PdfPTable table, String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        table.addCell(cell);
    }
}