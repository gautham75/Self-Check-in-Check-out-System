package com.gautham.selfcheckinsystem.util;

import com.gautham.selfcheckinsystem.dto.AttendanceReportDTO;
import com.gautham.selfcheckinsystem.dto.EventReportDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ExcelExporter {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static byte[] exportAttendanceReport(List<AttendanceReportDTO> reportList) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance Report");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            String[] columns = {"Participant Name", "Registration No", "Event Name", "Check-In Time", "Check-Out Time", "Duration (mins)", "Status"};

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (AttendanceReportDTO dto : reportList) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(dto.getParticipantName() != null ? dto.getParticipantName() : "");
                row.createCell(1).setCellValue(dto.getRegistrationNumber() != null ? dto.getRegistrationNumber() : "");
                row.createCell(2).setCellValue(dto.getEventName() != null ? dto.getEventName() : "");
                row.createCell(3).setCellValue(dto.getCheckInTime() != null ? dto.getCheckInTime().format(DATE_FORMATTER) : "N/A");
                row.createCell(4).setCellValue(dto.getCheckOutTime() != null ? dto.getCheckOutTime().format(DATE_FORMATTER) : "N/A");
                row.createCell(5).setCellValue(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 0);
                row.createCell(6).setCellValue(dto.getAttendanceStatus() != null ? dto.getAttendanceStatus() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public static byte[] exportEventReport(EventReportDTO dto) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Event Report");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("EVENT SUMMARY REPORT");
            titleCell.setCellStyle(headerCellStyle);

            int rowIdx = 2;
            if (dto.getEventDetails() != null) {
                sheet.createRow(rowIdx++).createCell(0).setCellValue("Event ID: " + dto.getEventDetails().getId());
                sheet.createRow(rowIdx++).createCell(0).setCellValue("Event Name: " + dto.getEventDetails().getEventName());
                sheet.createRow(rowIdx++).createCell(0).setCellValue("Location: " + dto.getEventDetails().getLocation());
                sheet.createRow(rowIdx++).createCell(0).setCellValue("Date: " + dto.getEventDetails().getEventDate());
            }

            rowIdx++;
            Row statsHeader = sheet.createRow(rowIdx++);
            Cell c0 = statsHeader.createCell(0);
            c0.setCellValue("Metric");
            c0.setCellStyle(headerCellStyle);

            Cell c1 = statsHeader.createCell(1);
            c1.setCellValue("Value");
            c1.setCellStyle(headerCellStyle);

            Row r1 = sheet.createRow(rowIdx++);
            r1.createCell(0).setCellValue("Total Participants");
            r1.createCell(1).setCellValue(dto.getTotalParticipants());

            Row r2 = sheet.createRow(rowIdx++);
            r2.createCell(0).setCellValue("Checked In");
            r2.createCell(1).setCellValue(dto.getCheckedIn());

            Row r3 = sheet.createRow(rowIdx++);
            r3.createCell(0).setCellValue("Checked Out");
            r3.createCell(1).setCellValue(dto.getCheckedOut());

            Row r4 = sheet.createRow(rowIdx++);
            r4.createCell(0).setCellValue("Average Duration (mins)");
            r4.createCell(1).setCellValue(dto.getAverageDurationMinutes());

            Row r5 = sheet.createRow(rowIdx++);
            r5.createCell(0).setCellValue("Certificates Generated");
            r5.createCell(1).setCellValue(dto.getCertificatesGenerated());

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
