package com.employee.management.service.impl;

import com.employee.management.dto.EmployeeRequest;
import com.employee.management.dto.EmployeeResponse;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.enums.EmployeeStatus;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.employee.management.entity.enums.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new DuplicateResourceException("Employee code already exists.");
        }

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found with id : " + request.getDepartmentId()));

        Employee employee = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .gender(request.getGender())
                .designation(request.getDesignation())
                .salary(request.getSalary())
                .joiningDate(request.getJoiningDate())
                .status(request.getStatus())
                .department(department)
                .build();

        Employee savedEmployee = employeeRepository.save(employee);

        return mapToResponse(savedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id : " + id));

        return mapToResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id : " + id));

        if (!employee.getEmployeeCode().equals(request.getEmployeeCode())
                && employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new DuplicateResourceException("Employee code already exists.");
        }

        if (!employee.getEmail().equals(request.getEmail())
                && employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found with id : "
                                        + request.getDepartmentId()));

        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setGender(request.getGender());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(request.getStatus());
        employee.setDepartment(department);

        Employee updatedEmployee = employeeRepository.save(employee);

        return mapToResponse(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id : " + id));

        employeeRepository.delete(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> searchEmployeesByFirstName(String firstName) {

        return employeeRepository
                .findByFirstNameContainingIgnoreCase(firstName)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesByDepartment(String departmentName) {

        return employeeRepository
                .findByDepartment_DepartmentName(departmentName)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    @Override
@Transactional(readOnly = true)
public List<EmployeeResponse> getEmployeesByStatus(EmployeeStatus status) {

    return employeeRepository.findByStatus(status)
            .stream()
            .map(this::mapToResponse)
            .toList();
}
@Override
@Transactional(readOnly = true)
public Page<EmployeeResponse> getEmployees(Pageable pageable) {

    return employeeRepository
            .findAll(pageable)
            .map(this::mapToResponse);
}

    /**
     * Converts Employee Entity to EmployeeResponse DTO
     */
    private EmployeeResponse mapToResponse(Employee employee) {

        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .gender(employee.getGender())
                .designation(employee.getDesignation())
                .salary(employee.getSalary())
                .joiningDate(employee.getJoiningDate())
                .status(employee.getStatus())
                .departmentName(employee.getDepartment().getDepartmentName())
                .build();
    }
}