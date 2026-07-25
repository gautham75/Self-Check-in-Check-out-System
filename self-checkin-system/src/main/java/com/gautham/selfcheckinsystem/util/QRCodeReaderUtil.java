package com.gautham.selfcheckinsystem.util;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;

import javax.imageio.ImageIO;
import java.io.File;

public class QRCodeReaderUtil {

    public static String readQRCode(String filePath) throws Exception {

        var bufferedImage = ImageIO.read(new File(filePath));

        BinaryBitmap bitmap = new BinaryBitmap(
                new HybridBinarizer(
                        new BufferedImageLuminanceSource(bufferedImage)));

        Result result = new MultiFormatReader().decode(bitmap);

        return result.getText();
    }
}