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

public interface EmployeeRepository extends JpaRepository<Employee, Long>,
        JpaSpecificationExecutor<Employee> {

    // Derived Query Methods

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    List<Employee> findByStatus(EmployeeStatus status);

    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);

    List<Employee> findByDepartment_DepartmentName(String departmentName);

    List<Employee> findByFirstNameContainingIgnoreCase(String firstName);

    // JPQL Queries

    @Query("""
        SELECT e
        FROM Employee e
        WHERE e.salary > :salary
    """)
    List<Employee> findEmployeesWithSalaryGreaterThan(@Param("salary") BigDecimal salary);

    @Query("""
        SELECT e
        FROM Employee e
        WHERE e.department.departmentName = :department
    """)
    List<Employee> findEmployeesByDepartment(@Param("department") String department);

    @Query("""
        SELECT COUNT(e)
        FROM Employee e
        WHERE e.status = :status
    """)
    Long countEmployeesByStatus(@Param("status") EmployeeStatus status);

    // Native SQL Query

    @Query(value = """
        SELECT *
        FROM employees
        ORDER BY salary DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Employee> findTopFiveHighestSalaryEmployees();
}