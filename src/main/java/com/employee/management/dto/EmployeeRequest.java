package com.employee.management.dto;

import com.employee.management.entity.enums.Designation;
import com.employee.management.entity.enums.EmployeeStatus;
import com.employee.management.entity.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRequest {

    @NotBlank
    @Size(min = 3, max = 20)
    private String employeeCode;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{10,13}$")
    private String phone;

    private Gender gender;

    private Designation designation;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal salary;

    @PastOrPresent
    private LocalDate joiningDate;

    private EmployeeStatus status;

    private Long departmentId;
}