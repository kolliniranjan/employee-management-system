package com.employee.management.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationResponse {

    private Long id;

    private String name;

    private String type;

    private Long ownerId;

    private String ownerName;

    private String ownerEmail;

    private LocalDateTime createdAt;
}