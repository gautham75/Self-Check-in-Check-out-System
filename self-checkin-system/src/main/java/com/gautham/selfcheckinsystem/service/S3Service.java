package com.gautham.selfcheckinsystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.bucket-name:selfcheckin-storage}")
    private String bucketName;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(String filePath) {
        File file = new File(filePath);
        String key = file.getName();

        try {
            if (s3Client != null) {
                PutObjectRequest request = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build();

                s3Client.putObject(request, RequestBody.fromFile(file));

                return "https://" + bucketName + ".s3.eu-north-1.amazonaws.com/" + key;
            }
        } catch (Exception e) {
            System.err.println("S3Service Notice: AWS S3 upload failed (" + e.getMessage() + "). Falling back to local file URL.");
        }

        if (key.startsWith("participant_")) {
            String idStr = key.replace("participant_", "").replace(".png", "");
            return "http://localhost:8080/api/participants/qrcode/" + idStr;
        }
        return "http://localhost:8080/api/certificate/view/" + key.replace("certificate_", "").replace(".pdf", "");
    }
}