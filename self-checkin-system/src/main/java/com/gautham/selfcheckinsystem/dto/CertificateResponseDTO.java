package com.gautham.selfcheckinsystem.dto;

public class CertificateResponseDTO {

    private String message;
    private String certificateUrl;

    public CertificateResponseDTO() {
    }

    public CertificateResponseDTO(String message, String certificateUrl) {
        this.message = message;
        this.certificateUrl = certificateUrl;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCertificateUrl() {
        return certificateUrl;
    }

    public void setCertificateUrl(String certificateUrl) {
        this.certificateUrl = certificateUrl;
    }
}
