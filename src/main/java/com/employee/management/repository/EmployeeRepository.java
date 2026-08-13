package com.employee.management.repository;

import com.employee.management.entity.Employee;
import com.employee.management.entity.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long>,
                JpaSpecificationExecutor<Employee> {

    // ==========================================
    // EXISTING DERIVED QUERY METHODS
    // ==========================================

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    List<Employee> findByStatus(EmployeeStatus status);

    Page<Employee> findByStatus(
            EmployeeStatus status,
            Pageable pageable
    );

    List<Employee> findByDepartment_DepartmentName(
            String departmentName
    );

    List<Employee> findByFirstNameContainingIgnoreCase(
            String firstName
    );


    // ==========================================
    // ORGANIZATION-AWARE QUERIES
    // ==========================================

    List<Employee> findByOrganizationId(
            Long organizationId
    );

    Optional<Employee> findByIdAndOrganizationId(
            Long id,
            Long organizationId
    );

    List<Employee> findByOrganizationIdAndFirstNameContainingIgnoreCase(
            Long organizationId,
            String firstName
    );

    List<Employee> findByOrganizationIdAndStatus(
            Long organizationId,
            EmployeeStatus status
    );

    List<Employee> findByOrganizationIdAndDepartment_DepartmentName(
            Long organizationId,
            String departmentName
    );

    Page<Employee> findByOrganizationId(
            Long organizationId,
            Pageable pageable
    );


    // ==========================================
    // ORGANIZATION + STATUS + PAGINATION
    // ==========================================

    Page<Employee> findByOrganizationIdAndStatus(
            Long organizationId,
            EmployeeStatus status,
            Pageable pageable
    );


    // ==========================================
    // JPQL QUERIES
    // ==========================================

    @Query("""
        SELECT e
        FROM Employee e
        WHERE e.salary > :salary
    """)
    List<Employee> findEmployeesWithSalaryGreaterThan(
            @Param("salary") BigDecimal salary
    );


    @Query("""
        SELECT e
        FROM Employee e
        WHERE e.department.departmentName = :department
    """)
    List<Employee> findEmployeesByDepartment(
            @Param("department") String department
    );


    @Query("""
        SELECT COUNT(e)
        FROM Employee e
        WHERE e.status = :status
    """)
    Long countEmployeesByStatus(
            @Param("status") EmployeeStatus status
    );


    // ==========================================
    // ORGANIZATION JPQL QUERIES
    // ==========================================

    @Query("""
        SELECT e
        FROM Employee e
        WHERE e.organization.id = :organizationId
          AND e.salary > :salary
    """)
    List<Employee> findEmployeesWithSalaryGreaterThanByOrganization(
            @Param("organizationId") Long organizationId,
            @Param("salary") BigDecimal salary
    );


    @Query("""
        SELECT COUNT(e)
        FROM Employee e
        WHERE e.organization.id = :organizationId
          AND e.status = :status
    """)
    Long countEmployeesByOrganizationAndStatus(
            @Param("organizationId") Long organizationId,
            @Param("status") EmployeeStatus status
    );


    // ==========================================
    // NATIVE SQL QUERY
    // ==========================================

    @Query(value = """
        SELECT *
        FROM employees
        ORDER BY salary DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Employee> findTopFiveHighestSalaryEmployees();


    // ==========================================
    // ORGANIZATION TOP 5
    // ==========================================

    @Query(value = """
        SELECT *
        FROM employees
        WHERE organization_id = :organizationId
        ORDER BY salary DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Employee> findTopFiveHighestSalaryEmployeesByOrganization(
            @Param("organizationId") Long organizationId
    );
}