package com.employee.management.service;

import com.employee.management.dto.EmployeeRequest;
import com.employee.management.dto.EmployeeResponse;
import com.employee.management.entity.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse getEmployeeById(Long id);

    List<EmployeeResponse> getAllEmployees();

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    void deleteEmployee(Long id);

    List<EmployeeResponse> searchEmployeesByFirstName(String firstName);

    List<EmployeeResponse> getEmployeesByDepartment(String departmentName);

    List<EmployeeResponse> getEmployeesByStatus(EmployeeStatus status);

    Page<EmployeeResponse> getEmployees(Pageable pageable);

}