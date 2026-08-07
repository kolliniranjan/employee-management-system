package com.employee.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentRequest {

    @NotBlank(message = "Department Code is required")
    @Size(min = 2, max = 20)
    private String departmentCode;

    @NotBlank(message = "Department Name is required")
    @Size(max = 100)
    private String departmentName;

    @Size(max = 255)
    private String description;
}