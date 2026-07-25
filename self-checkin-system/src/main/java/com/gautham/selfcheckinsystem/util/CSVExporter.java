package com.gautham.selfcheckinsystem.util;

import com.gautham.selfcheckinsystem.entity.Participant;
import com.opencsv.CSVWriter;

import java.io.StringWriter;
import java.util.List;

public class CSVExporter {

    public static String exportParticipants(List<Participant> participants) {

        StringWriter writer = new StringWriter();

        CSVWriter csvWriter = new CSVWriter(writer);

        String[] header = {
                "ID",
                "Name",
                "Email",
                "Phone",
                "Checked In",
                "Checked Out",
                "Duration (Minutes)"
        };

        csvWriter.writeNext(header);

        for (Participant participant : participants) {

            String[] row = {
                    String.valueOf(participant.getId()),
                    participant.getFullName(),
                    participant.getEmail(),
                    "'" + participant.getPhone(),
                    String.valueOf(participant.isCheckedIn()),
                    String.valueOf(participant.isCheckedOut()),
                    String.valueOf(participant.getDurationMinutes())
            };

            csvWriter.writeNext(row);
        }

        try {
            csvWriter.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return writer.toString();
    }
}