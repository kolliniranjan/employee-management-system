package com.employee.management.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationUpdateRequest {

    @NotBlank(message = "Organization name is required")
    private String name;

    @NotBlank(message = "Organization type is required")
    private String type;
}