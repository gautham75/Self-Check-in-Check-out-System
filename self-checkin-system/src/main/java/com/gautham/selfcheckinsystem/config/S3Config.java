package com.gautham.selfcheckinsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${aws.access-key:}")
    private String accessKey;

    @Value("${aws.secret-key:}")
    private String secretKey;

    @Value("${aws.region:eu-north-1}")
    private String region;

    @Bean
    public S3Client s3Client() {
        if (accessKey == null || accessKey.isBlank() || secretKey == null || secretKey.isBlank()) {
            System.out.println("S3Config Notice: AWS credentials are not set. S3Client initialized as null for local/direct fallback.");
            return null;
        }

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(accessKey, secretKey);

        return S3Client.builder()
                .region(Region.of(region != null && !region.isBlank() ? region : "eu-north-1"))
                .credentialsProvider(
                        StaticCredentialsProvider.create(credentials))
                .build();
    }
}