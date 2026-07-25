package com.gautham.selfcheckinsystem.util;

import com.gautham.selfcheckinsystem.entity.Participant;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class CertificateGeneratorUtil {

    private static final String DEFAULT_ORGANIZATION = "EVENTSYNC ACADEMY OF TECHNOLOGY";

    public static File generateCertificate(Participant participant, String outputDirPath) throws Exception {

        File dir = new File(outputDirPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = "certificate_" + participant.getId() + ".pdf";
        File pdfFile = new File(dir, fileName);

        // Landscape A4 document with tight 24pt margins to guarantee 100% single page placement
        Document document = new Document(PageSize.A4.rotate(), 24, 24, 24, 24);
        PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(pdfFile));

        // Ornate Page Border Event
        writer.setPageEvent(new PremiumCertificateBorderEvent());

        document.open();

        // Color Palette
        Color navyColor = new Color(30, 58, 138);     // Royal Navy #1E3A8A
        Color goldColor = new Color(217, 119, 6);     // Warm Gold #D97706
        Color darkTextColor = new Color(33, 34, 39);   // Onyx Dark #212227
        Color nameColor = new Color(153, 27, 27);     // Crimson Accent #991B1B

        // Fonts
        Font orgFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, goldColor);
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, navyColor);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 12, Color.DARK_GRAY);
        Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, nameColor);
        Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 11, darkTextColor);
        Font eventFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, navyColor);
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.GRAY);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, darkTextColor);

        // 1. Organization Header
        Paragraph orgPara = new Paragraph(DEFAULT_ORGANIZATION, orgFont);
        orgPara.setAlignment(Element.ALIGN_CENTER);
        orgPara.setSpacingAfter(4);
        document.add(orgPara);

        // 2. Main Title
        Paragraph titlePara = new Paragraph("CERTIFICATE OF EXCELLENCE", titleFont);
        titlePara.setAlignment(Element.ALIGN_CENTER);
        titlePara.setSpacingAfter(8);
        document.add(titlePara);

        // 3. Subtitle
        Paragraph subPara = new Paragraph("THIS IS PROUDLY PRESENTED TO", subtitleFont);
        subPara.setAlignment(Element.ALIGN_CENTER);
        subPara.setSpacingAfter(6);
        document.add(subPara);

        // 4. Participant Name
        String fullName = participant.getFullName() != null ? participant.getFullName() : "N/A";
        Paragraph namePara = new Paragraph(fullName.toUpperCase(), nameFont);
        namePara.setAlignment(Element.ALIGN_CENTER);
        namePara.setSpacingAfter(6);
        document.add(namePara);

        // 5. Body Text
        Paragraph bodyPara = new Paragraph(
                "for active participation and successful completion of check-in and attendance requirements at",
                textFont
        );
        bodyPara.setAlignment(Element.ALIGN_CENTER);
        bodyPara.setSpacingAfter(6);
        document.add(bodyPara);

        // 6. Event Name
        String eventName = (participant.getEvent() != null && participant.getEvent().getEventName() != null)
                ? participant.getEvent().getEventName()
                : "Special Event";
        Paragraph eventPara = new Paragraph(eventName, eventFont);
        eventPara.setAlignment(Element.ALIGN_CENTER);
        eventPara.setSpacingAfter(14);
        document.add(eventPara);

        // 7. Details Table: Reg No, College, Department, Date, Certificate ID
        PdfPTable detailsTable = new PdfPTable(4);
        detailsTable.setWidthPercentage(85);
        detailsTable.setWidths(new float[]{1.2f, 2.0f, 1.2f, 2.0f});
        detailsTable.setSpacingAfter(16);

        addDetailRow4(detailsTable, "REG NO:", participant.getRegistrationNumber() != null ? participant.getRegistrationNumber() : "N/A",
                "COLLEGE:", participant.getCollege() != null ? participant.getCollege() : "N/A", labelFont, valueFont);

        String eventDateStr;
        if (participant.getEvent() != null && participant.getEvent().getEventDate() != null) {
            eventDateStr = participant.getEvent().getEventDate().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        } else {
            eventDateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        }

        String certId = "CERT-" + (participant.getId() != null ? participant.getId() : "0000");
        addDetailRow4(detailsTable, "DEPARTMENT:", participant.getDepartment() != null ? participant.getDepartment() : "N/A",
                "DATE & ID:", eventDateStr + " | " + certId, labelFont, valueFont);

        document.add(detailsTable);

        // 8. 3-Column Footer Table: Logo/QR (Left), Official Seal (Center), Organizer Signature (Right)
        PdfPTable footerTable = new PdfPTable(3);
        footerTable.setWidthPercentage(90);
        footerTable.setWidths(new float[]{1f, 1f, 1f});

        // Left Cell: Event Logo / QR Badge
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        leftCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Image logoImg = createEventLogoBadge(writer, eventName);
        if (logoImg != null) {
            logoImg.setAlignment(Element.ALIGN_CENTER);
            leftCell.addElement(logoImg);
        }
        Paragraph logoLabel = new Paragraph("OFFICIAL EVENT LOGO", labelFont);
        logoLabel.setAlignment(Element.ALIGN_CENTER);
        leftCell.addElement(logoLabel);
        footerTable.addCell(leftCell);

        // Center Cell: Official Gold Security Seal
        PdfPCell centerCell = new PdfPCell();
        centerCell.setBorder(Rectangle.NO_BORDER);
        centerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        centerCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Image sealImg = createOfficialGoldSeal(writer);
        if (sealImg != null) {
            sealImg.setAlignment(Element.ALIGN_CENTER);
            centerCell.addElement(sealImg);
        }
        Paragraph sealLabel = new Paragraph("VERIFIED ATTENDANCE", labelFont);
        sealLabel.setAlignment(Element.ALIGN_CENTER);
        centerCell.addElement(sealLabel);
        footerTable.addCell(centerCell);

        // Right Cell: Organizer Signature
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        Image sigImg = createSignatureVector(writer);
        if (sigImg != null) {
            sigImg.setAlignment(Element.ALIGN_CENTER);
            rightCell.addElement(sigImg);
        }
        Paragraph sigLine = new Paragraph("_______________________", valueFont);
        sigLine.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(sigLine);

        Paragraph sigLabel = new Paragraph("ORGANIZER SIGNATURE", labelFont);
        sigLabel.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(sigLabel);
        footerTable.addCell(rightCell);

        document.add(footerTable);

        document.close();

        return pdfFile;
    }

    private static void addDetailRow4(PdfPTable table, String l1, String v1, String l2, String v2, Font labelFont, Font valueFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(l1, labelFont));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c1.setPadding(3);

        PdfPCell c2 = new PdfPCell(new Phrase(v1, valueFont));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setHorizontalAlignment(Element.ALIGN_LEFT);
        c2.setPadding(3);

        PdfPCell c3 = new PdfPCell(new Phrase(l2, labelFont));
        c3.setBorder(Rectangle.NO_BORDER);
        c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c3.setPadding(3);

        PdfPCell c4 = new PdfPCell(new Phrase(v2, valueFont));
        c4.setBorder(Rectangle.NO_BORDER);
        c4.setHorizontalAlignment(Element.ALIGN_LEFT);
        c4.setPadding(3);

        table.addCell(c1);
        table.addCell(c2);
        table.addCell(c3);
        table.addCell(c4);
    }

    private static Image createEventLogoBadge(PdfWriter writer, String eventName) {
        try {
            PdfTemplate template = writer.getDirectContent().createTemplate(50, 50);
            // Outer Navy Shield Circle
            template.setColorStroke(new Color(30, 58, 138));
            template.setColorFill(new Color(241, 245, 249));
            template.setLineWidth(2);
            template.circle(25, 25, 22);
            template.fillStroke();

            // Inner Gold Accent Ring
            template.setColorStroke(new Color(217, 119, 6));
            template.setLineWidth(1);
            template.circle(25, 25, 18);
            template.stroke();

            // Text / Initials
            String initials = eventName.length() >= 2 ? eventName.substring(0, 2).toUpperCase() : "EV";
            template.setColorFill(new Color(30, 58, 138));
            template.setFontAndSize(BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, false), 12);
            template.beginText();
            template.showTextAligned(Element.ALIGN_CENTER, initials, 25, 20, 0);
            template.endText();

            return Image.getInstance(template);
        } catch (Exception e) {
            return null;
        }
    }

    private static Image createOfficialGoldSeal(PdfWriter writer) {
        try {
            PdfTemplate template = writer.getDirectContent().createTemplate(50, 50);
            // Gold Starburst Background
            template.setColorStroke(new Color(217, 119, 6));
            template.setColorFill(new Color(254, 243, 199));
            template.setLineWidth(2);
            template.circle(25, 25, 22);
            template.fillStroke();

            // Inner Ribbon Circle
            template.setColorStroke(new Color(180, 83, 9));
            template.setLineWidth(1.5f);
            template.circle(25, 25, 16);
            template.stroke();

            template.setColorFill(new Color(180, 83, 9));
            template.setFontAndSize(BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, false), 8);
            template.beginText();
            template.showTextAligned(Element.ALIGN_CENTER, "SEAL", 25, 22, 0);
            template.endText();

            return Image.getInstance(template);
        } catch (Exception e) {
            return null;
        }
    }

    private static Image createSignatureVector(PdfWriter writer) {
        try {
            PdfTemplate template = writer.getDirectContent().createTemplate(100, 30);
            template.setColorStroke(new Color(30, 58, 138));
            template.setLineWidth(1.5f);
            template.moveTo(10, 10);
            template.curveTo(25, 28, 45, 2, 65, 20);
            template.curveTo(75, 28, 88, 8, 95, 15);
            template.stroke();

            return Image.getInstance(template);
        } catch (Exception e) {
            return null;
        }
    }

    private static class PremiumCertificateBorderEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Rectangle page = document.getPageSize();

            // Outer Royal Navy Border
            cb.setLineWidth(3.5f);
            cb.setColorStroke(new Color(30, 58, 138));
            cb.rectangle(14, 14, page.getWidth() - 28, page.getHeight() - 28);
            cb.stroke();

            // Inner Warm Gold Border
            cb.setLineWidth(1.5f);
            cb.setColorStroke(new Color(217, 119, 6));
            cb.rectangle(19, 19, page.getWidth() - 38, page.getHeight() - 38);
            cb.stroke();
        }
    }
}
