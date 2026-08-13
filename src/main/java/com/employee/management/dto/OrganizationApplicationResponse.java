package com.employee.management.dto;

import com.employee.management.entity.enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationApplicationResponse {

    private Long id;

    private String organizationName;

    private String organizationType;

    private String applicantPosition;

    private String contactNumber;

    private String reason;

    private ApplicationStatus status;

    private Long applicantId;

    private String applicantName;

    private String applicantEmail;

    private LocalDateTime appliedAt;

    private LocalDateTime reviewedAt;
}