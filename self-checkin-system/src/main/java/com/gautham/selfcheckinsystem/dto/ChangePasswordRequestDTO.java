package com.gautham.selfcheckinsystem.dto;

import jakarta.validation.constraints.NotBlank;

public class ChangePasswordRequestDTO {

    @NotBlank(message = "Current password is required")
    private String oldPassword;

    @NotBlank(message = "New password is required")
    private String newPassword;

    public ChangePasswordRequestDTO() {
    }

    public ChangePasswordRequestDTO(String oldPassword, String newPassword) {
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
