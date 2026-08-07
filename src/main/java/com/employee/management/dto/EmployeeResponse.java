package com.employee.management.dto;

import com.employee.management.entity.enums.Designation;
import com.employee.management.entity.enums.EmployeeStatus;
import com.employee.management.entity.enums.Gender;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private Long id;

    private String employeeCode;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private Gender gender;

    private Designation designation;

    private BigDecimal salary;

    private LocalDate joiningDate;

    private EmployeeStatus status;

    private String departmentName;
}