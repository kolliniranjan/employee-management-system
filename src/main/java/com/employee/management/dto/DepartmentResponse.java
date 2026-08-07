package com.employee.management.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentResponse {

    private Long id;

    private String departmentCode;

    private String departmentName;

    private String description;
}