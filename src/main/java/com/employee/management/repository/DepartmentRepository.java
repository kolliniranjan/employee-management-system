package com.employee.management.repository;

import com.employee.management.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    // ==========================================
    // EXISTING METHODS
    // ==========================================

    Optional<Department> findByDepartmentCode(
            String departmentCode
    );

    Optional<Department> findByDepartmentName(
            String departmentName
    );

    boolean existsByDepartmentCode(
            String departmentCode
    );

    boolean existsByDepartmentName(
            String departmentName
    );


    // ==========================================
    // ORGANIZATION-AWARE METHODS
    // ==========================================

    List<Department> findByOrganizationId(
            Long organizationId
    );

    Optional<Department> findByIdAndOrganizationId(
            Long id,
            Long organizationId
    );

    boolean existsByDepartmentCodeAndOrganizationId(
            String departmentCode,
            Long organizationId
    );

    boolean existsByDepartmentNameAndOrganizationId(
            String departmentName,
            Long organizationId
    );
}