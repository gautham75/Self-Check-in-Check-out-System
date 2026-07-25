package com.gautham.selfcheckinsystem.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class QRCodeGenerator {

    public static String generateQRCode(String text, String fileName)
            throws WriterException, IOException {

        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        BitMatrix bitMatrix =
                qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 300, 300);

        // Save inside your project folder
        Path folder = Paths.get(System.getProperty("user.dir"), "qrcodes");

        Files.createDirectories(folder);

        Path file = folder.resolve(fileName + ".png");

        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", file);

        System.out.println("QR saved at:");
        System.out.println(file.toAbsolutePath());

        return file.toAbsolutePath().toString();
    }
}