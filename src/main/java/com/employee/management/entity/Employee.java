package com.employee.management.entity;

import com.employee.management.entity.enums.Designation;
import com.employee.management.entity.enums.EmployeeStatus;
import com.employee.management.entity.enums.Gender;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import lombok.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "employees",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_employee_code",
            columnNames = "employee_code"
        ),
        @UniqueConstraint(
            name = "uk_employee_email",
            columnNames = "email"
        )
    },
    indexes = {
        @Index(
            name = "idx_employee_department",
            columnList = "department_id"
        ),
        @Index(
            name = "idx_employee_organization",
            columnList = "organization_id"
        )
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Employee {

    // ==========================================
    // PRIMARY KEY
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // EMPLOYEE CODE
    // ==========================================

    @NotBlank(message = "Employee Code is required")
    @Size(min = 3, max = 20)
    @Column(
        name = "employee_code",
        nullable = false,
        length = 20
    )
    private String employeeCode;


    // ==========================================
    // FIRST NAME
    // ==========================================

    @NotBlank(message = "First Name is required")
    @Size(max = 50)
    @Column(
        name = "first_name",
        nullable = false,
        length = 50
    )
    private String firstName;


    // ==========================================
    // LAST NAME
    // ==========================================

    @NotBlank(message = "Last Name is required")
    @Size(max = 50)
    @Column(
        name = "last_name",
        nullable = false,
        length = 50
    )
    private String lastName;


    // ==========================================
    // EMAIL
    // ==========================================

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid Email")
    @Size(max = 100)
    @Column(
        nullable = false,
        length = 100
    )
    private String email;


    // ==========================================
    // PHONE
    // ==========================================

    @NotBlank(message = "Phone Number is required")
    @Pattern(
        regexp = "^\\+?[0-9]{10,13}$",
        message = "Invalid Phone Number"
    )
    @Column(
        nullable = false,
        length = 15
    )
    private String phone;


    // ==========================================
    // GENDER
    // ==========================================

    @NotNull(message = "Gender is required")
    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 10
    )
    private Gender gender;


    // ==========================================
    // DESIGNATION
    // ==========================================

    @NotNull(message = "Designation is required")
    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 40
    )
    private Designation designation;


    // ==========================================
    // SALARY
    // ==========================================

    @NotNull(message = "Salary is required")
    @DecimalMin(
        value = "0.0",
        inclusive = false
    )
    @Digits(
        integer = 10,
        fraction = 2
    )
    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal salary;


    // ==========================================
    // JOINING DATE
    // ==========================================

    @NotNull(message = "Joining Date is required")
    @PastOrPresent
    @Column(
        name = "joining_date",
        nullable = false
    )
    private LocalDate joiningDate;


    // ==========================================
    // STATUS
    // ==========================================

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private EmployeeStatus status;


    // ==========================================
    // DEPARTMENT
    // ==========================================

    @NotNull(message = "Department is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "department_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_employee_department"
        )
    )
    @ToString.Exclude
    private Department department;


    // ==========================================
    // ORGANIZATION
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "organization_id",
        foreignKey = @ForeignKey(
            name = "fk_employee_organization"
        )
    )
    @ToString.Exclude
    private Organization organization;


    // ==========================================
    // AUDITING
    // ==========================================

    @CreatedDate
    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;


    @LastModifiedDate
    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;
}