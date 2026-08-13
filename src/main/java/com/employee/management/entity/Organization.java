package com.employee.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Organization {

    // ==========================================
    // PRIMARY KEY
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // ORGANIZATION DETAILS
    // ==========================================

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    // ==========================================
// ORGANIZATION MEMBERS
// ==========================================

@OneToMany(
        mappedBy = "organization",
        fetch = FetchType.LAZY
)
@Builder.Default
@ToString.Exclude
private List<User> members = new ArrayList<>();
    // ==========================================
    // OWNER
    // ==========================================

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "owner_id",
        nullable = false,
        unique = true
    )
    @ToString.Exclude
    private User owner;


    // ==========================================
    // CREATED DATE
    // ==========================================

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt =
            LocalDateTime.now();


    // ==========================================
    // DEPARTMENTS
    // ==========================================

    @OneToMany(
        mappedBy = "organization",
        fetch = FetchType.LAZY
    )
    @Builder.Default
    @ToString.Exclude
    private List<Department> departments =
            new ArrayList<>();


    // ==========================================
    // EMPLOYEES
    // ==========================================

    @OneToMany(
        mappedBy = "organization",
        fetch = FetchType.LAZY
    )
    @Builder.Default
    @ToString.Exclude
    private List<Employee> employees =
            new ArrayList<>();
}