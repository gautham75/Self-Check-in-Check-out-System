package com.gautham.selfcheckinsystem.controller;

import com.gautham.selfcheckinsystem.service.S3Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class S3TestController {

    private final S3Service s3Service;

    public S3TestController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @GetMapping("/api/s3/test")
    public String uploadTest() {

        return s3Service.uploadFile("qrcodes/participant_3.png");
    }
}