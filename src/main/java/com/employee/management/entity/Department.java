package com.employee.management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "departments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_department_code",
                        columnNames = "department_code"
                )
        }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "employees")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Department code is required")
    @Size(min = 2, max = 20)
    @Column(name = "department_code", nullable = false, length = 20)
    private String departmentCode;

    @NotBlank(message = "Department name is required")
    @Size(max = 100)
    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @Size(max = 255)
    @Column(length = 255)
    private String description;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Employee> employees = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}