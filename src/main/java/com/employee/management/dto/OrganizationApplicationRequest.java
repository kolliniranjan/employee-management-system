package com.employee.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationApplicationRequest {

    @NotBlank(message = "Organization name is required")
    @Size(max = 150, message = "Organization name must not exceed 150 characters")
    private String organizationName;

    @NotBlank(message = "Organization type is required")
    @Size(max = 100, message = "Organization type must not exceed 100 characters")
    private String organizationType;

    @NotBlank(message = "Applicant position is required")
    @Size(max = 100, message = "Applicant position must not exceed 100 characters")
    private String applicantPosition;

    @NotBlank(message = "Contact number is required")
    @Size(max = 20, message = "Contact number must not exceed 20 characters")
    private String contactNumber;

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    private String reason;
}