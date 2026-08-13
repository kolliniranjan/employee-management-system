package com.employee.management.service.impl;

import com.employee.management.dto.EmployeeRequest;
import com.employee.management.dto.EmployeeResponse;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.Organization;
import com.employee.management.entity.User;
import com.employee.management.entity.enums.EmployeeStatus;
import com.employee.management.entity.enums.Role;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.OrganizationRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.service.EmployeeService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;


    // ==========================================
    // CREATE EMPLOYEE
    // ==========================================

    @Override
    @PreAuthorize(
    "hasRole('ADMIN') or " +
    "@organizationAuthorizationService.isOrganizationOwner()"
)
    public EmployeeResponse createEmployee(
            EmployeeRequest request) {

        if (employeeRepository.existsByEmployeeCode(
                request.getEmployeeCode())) {

            throw new DuplicateResourceException(
                    "Employee code already exists."
            );
        }

        if (employeeRepository.existsByEmail(
                request.getEmail())) {

            throw new DuplicateResourceException(
                    "Email already exists."
            );
        }


        Department department =
                departmentRepository.findById(
                        request.getDepartmentId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found with id : "
                                        + request.getDepartmentId()
                        )
                );


        Employee employee =
                Employee.builder()
                        .employeeCode(
                                request.getEmployeeCode()
                        )
                        .firstName(
                                request.getFirstName()
                        )
                        .lastName(
                                request.getLastName()
                        )
                        .email(
                                request.getEmail()
                        )
                        .phone(
                                request.getPhone()
                        )
                        .gender(
                                request.getGender()
                        )
                        .designation(
                                request.getDesignation()
                        )
                        .salary(
                                request.getSalary()
                        )
                        .joiningDate(
                                request.getJoiningDate()
                        )
                        .status(
                                request.getStatus()
                        )
                        .department(
                                department
                        )
                        .build();


        // ==========================================
        // ORGANIZATION ASSIGNMENT
        // ==========================================

        User currentUser =
                getCurrentUser();


        if (currentUser.getRole() != Role.ADMIN) {

            Organization organization =
                    getCurrentUserOrganization(
                            currentUser
                    );

            employee.setOrganization(
                    organization
            );

            // Make sure department belongs
            // to the same organization.

            if (department.getOrganization() == null ||
                    !department.getOrganization()
                            .getId()
                            .equals(organization.getId())) {

                throw new IllegalStateException(
                        "Department does not belong to your organization."
                );
            }
        }


        Employee savedEmployee =
                employeeRepository.save(employee);

        return mapToResponse(savedEmployee);
    }


    // ==========================================
    // GET EMPLOYEE BY ID
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee;

        if (isAdmin()) {

            employee =
                    employeeRepository.findById(id)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Employee not found with id : "
                                                    + id
                                    )
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employee =
                    employeeRepository
                            .findByIdAndOrganizationId(
                                    id,
                                    organization.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Employee not found with id : "
                                                    + id
                                    )
                            );
        }

        return mapToResponse(employee);
    }


    // ==========================================
    // GET ALL EMPLOYEES
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {

        List<Employee> employees;

        if (isAdmin()) {

            employees =
                    employeeRepository.findAll();

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employees =
                    employeeRepository
                            .findByOrganizationId(
                                    organization.getId()
                            );
        }

        return employees
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // UPDATE EMPLOYEE
    // ==========================================

    @Override
    @PreAuthorize(
    "hasRole('ADMIN') or " +
    "@organizationAuthorizationService.isOrganizationOwner()"
)
    public EmployeeResponse updateEmployee(
            Long id,
            EmployeeRequest request) {

        Employee employee;

        if (isAdmin()) {

            employee =
                    employeeRepository.findById(id)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Employee not found with id : "
                                                    + id
                                    )
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employee =
                    employeeRepository
                            .findByIdAndOrganizationId(
                                    id,
                                    organization.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Employee not found with id : "
                                                    + id
                                    )
                            );
        }


        // ==========================================
        // DUPLICATE EMPLOYEE CODE
        // ==========================================

        if (!employee.getEmployeeCode()
                .equals(request.getEmployeeCode())
                &&
                employeeRepository.existsByEmployeeCode(
                        request.getEmployeeCode())) {

            throw new DuplicateResourceException(
                    "Employee code already exists."
            );
        }


        // ==========================================
        // DUPLICATE EMAIL
        // ==========================================

        if (!employee.getEmail()
                .equals(request.getEmail())
                &&
                employeeRepository.existsByEmail(
                        request.getEmail())) {

            throw new DuplicateResourceException(
                    "Email already exists."
            );
        }


        Department department =
                departmentRepository.findById(
                        request.getDepartmentId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found with id : "
                                        + request.getDepartmentId()
                        )
                );


        // ==========================================
        // ORGANIZATION CHECK
        // ==========================================

        if (!isAdmin()) {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            if (department.getOrganization() == null ||
                    !department.getOrganization()
                            .getId()
                            .equals(organization.getId())) {

                throw new IllegalStateException(
                        "Department does not belong to your organization."
                );
            }

            employee.setOrganization(
                    organization
            );
        }


        // ==========================================
        // UPDATE FIELDS
        // ==========================================

        employee.setEmployeeCode(
                request.getEmployeeCode()
        );

        employee.setFirstName(
                request.getFirstName()
        );

        employee.setLastName(
                request.getLastName()
        );

        employee.setEmail(
                request.getEmail()
        );

        employee.setPhone(
                request.getPhone()
        );

        employee.setGender(
                request.getGender()
        );

        employee.setDesignation(
                request.getDesignation()
        );

        employee.setSalary(
                request.getSalary()
        );

        employee.setJoiningDate(
                request.getJoiningDate()
        );

        employee.setStatus(
                request.getStatus()
        );

        employee.setDepartment(
                department
        );


        Employee updatedEmployee =
                employeeRepository.save(employee);

        return mapToResponse(updatedEmployee);
    }


    // ==========================================
    // DELETE EMPLOYEE
    // ==========================================

    @Override
    @PreAuthorize(
    "hasRole('ADMIN') or " +
    "@organizationAuthorizationService.isOrganizationOwner()"
)
    public void deleteEmployee(Long id) {

        Employee employee;

        if (isAdmin()) {

            employee =
                    employeeRepository.findById(id)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Employee not found with id : "
                                                    + id
                                    )
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employee =
                    employeeRepository
                            .findByIdAndOrganizationId(
                                    id,
                                    organization.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Employee not found with id : "
                                                    + id
                                    )
                            );
        }

        employeeRepository.delete(employee);
    }


    // ==========================================
    // SEARCH BY FIRST NAME
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse>
    searchEmployeesByFirstName(
            String firstName) {

        List<Employee> employees;

        if (isAdmin()) {

            employees =
                    employeeRepository
                            .findByFirstNameContainingIgnoreCase(
                                    firstName
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employees =
                    employeeRepository
                            .findByOrganizationIdAndFirstNameContainingIgnoreCase(
                                    organization.getId(),
                                    firstName
                            );
        }

        return employees
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // GET EMPLOYEES BY DEPARTMENT
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse>
    getEmployeesByDepartment(
            String departmentName) {

        List<Employee> employees;

        if (isAdmin()) {

            employees =
                    employeeRepository
                            .findByDepartment_DepartmentName(
                                    departmentName
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employees =
                    employeeRepository
                            .findByOrganizationIdAndDepartment_DepartmentName(
                                    organization.getId(),
                                    departmentName
                            );
        }

        return employees
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // GET EMPLOYEES BY STATUS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse>
    getEmployeesByStatus(
            EmployeeStatus status) {

        List<Employee> employees;

        if (isAdmin()) {

            employees =
                    employeeRepository
                            .findByStatus(status);

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employees =
                    employeeRepository
                            .findByOrganizationIdAndStatus(
                                    organization.getId(),
                                    status
                            );
        }

        return employees
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // PAGINATION
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse>
    getEmployees(Pageable pageable) {

        Page<Employee> employees;

        if (isAdmin()) {

            employees =
                    employeeRepository
                            .findAll(pageable);

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            employees =
                    employeeRepository
                            .findByOrganizationId(
                                    organization.getId(),
                                    pageable
                            );
        }

        return employees.map(
                this::mapToResponse
        );
    }


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated."
            );
        }


        String email =
                authentication.getName();


        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found."
                        )
                );
    }


    // ==========================================
    // GET CURRENT ORGANIZATION
    // ==========================================

    private Organization getCurrentUserOrganization(User user) {

    if (user.getOrganization() == null) {

        throw new ResourceNotFoundException(
                "You are not associated with an organization."
        );
    }

    return user.getOrganization();
}


    // ==========================================
    // CHECK ADMIN
    // ==========================================

    private boolean isAdmin() {

        User user = getCurrentUser();

        return user.getRole() == Role.ADMIN;
    }


    // ==========================================
    // MAP ENTITY → RESPONSE
    // ==========================================

    private EmployeeResponse mapToResponse(
            Employee employee) {

        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeCode(
                        employee.getEmployeeCode()
                )
                .firstName(
                        employee.getFirstName()
                )
                .lastName(
                        employee.getLastName()
                )
                .email(
                        employee.getEmail()
                )
                .phone(
                        employee.getPhone()
                )
                .gender(
                        employee.getGender()
                )
                .designation(
                        employee.getDesignation()
                )
                .salary(
                        employee.getSalary()
                )
                .joiningDate(
                        employee.getJoiningDate()
                )
                .status(
                        employee.getStatus()
                )
                .departmentName(
                        employee.getDepartment()
                                .getDepartmentName()
                )
                .build();
    }
}