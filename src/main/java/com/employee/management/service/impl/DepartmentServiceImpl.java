package com.employee.management.service.impl;

import com.employee.management.dto.DepartmentRequest;
import com.employee.management.dto.DepartmentResponse;
import com.employee.management.entity.Department;
import com.employee.management.entity.Organization;
import com.employee.management.entity.User;
import com.employee.management.entity.enums.Role;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.OrganizationRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.service.DepartmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentServiceImpl
        implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;


    // ==========================================
    // CREATE DEPARTMENT
    // ==========================================

    @Override
    @PreAuthorize(
    "hasRole('ADMIN') or " +
    "@organizationAuthorizationService.isOrganizationOwner()"
)
    public DepartmentResponse createDepartment(
            DepartmentRequest request) {

        User currentUser = getCurrentUser();

        Organization organization = null;

        // ==========================================
        // ORGANIZATION OWNER
        // ==========================================

        if (currentUser.getRole() != Role.ADMIN) {

            organization =
                    getCurrentUserOrganization(
                            currentUser
                    );


            // Check department code inside
            // current organization

            if (departmentRepository
                    .existsByDepartmentCodeAndOrganizationId(
                            request.getDepartmentCode(),
                            organization.getId()
                    )) {

                throw new DuplicateResourceException(
                        "Department code already exists."
                );
            }


            // Check department name inside
            // current organization

            if (departmentRepository
                    .existsByDepartmentNameAndOrganizationId(
                            request.getDepartmentName(),
                            organization.getId()
                    )) {

                throw new DuplicateResourceException(
                        "Department name already exists."
                );
            }

        } else {

            // ==========================================
            // SYSTEM ADMIN
            // ==========================================

            if (departmentRepository
                    .existsByDepartmentCode(
                            request.getDepartmentCode()
                    )) {

                throw new DuplicateResourceException(
                        "Department code already exists."
                );
            }

            if (departmentRepository
                    .existsByDepartmentName(
                            request.getDepartmentName()
                    )) {

                throw new DuplicateResourceException(
                        "Department name already exists."
                );
            }
        }


        // ==========================================
        // CREATE DEPARTMENT
        // ==========================================

        Department department =
                Department.builder()
                        .departmentCode(
                                request.getDepartmentCode()
                        )
                        .departmentName(
                                request.getDepartmentName()
                        )
                        .description(
                                request.getDescription()
                        )
                        .organization(
                                organization
                        )
                        .build();


        Department savedDepartment =
                departmentRepository.save(
                        department
                );

        return mapToResponse(
                savedDepartment
        );
    }


    // ==========================================
    // GET DEPARTMENT BY ID
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(
            Long id) {

        Department department;

        if (isAdmin()) {

            department =
                    departmentRepository.findById(id)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Department not found with id : "
                                                    + id
                                    )
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            department =
                    departmentRepository
                            .findByIdAndOrganizationId(
                                    id,
                                    organization.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Department not found with id : "
                                                    + id
                                    )
                            );
        }

        return mapToResponse(
                department
        );
    }


    // ==========================================
    // GET ALL DEPARTMENTS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse>
    getAllDepartments() {

        List<Department> departments;

        if (isAdmin()) {

            departments =
                    departmentRepository.findAll();

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            departments =
                    departmentRepository
                            .findByOrganizationId(
                                    organization.getId()
                            );
        }

        return departments
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // UPDATE DEPARTMENT
    // ==========================================

    @Override
    @PreAuthorize(
    "hasRole('ADMIN') or " +
    "@organizationAuthorizationService.isOrganizationOwner()"
)
    public DepartmentResponse updateDepartment(
            Long id,
            DepartmentRequest request) {

        Department department;

        if (isAdmin()) {

            department =
                    departmentRepository.findById(id)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Department not found with id : "
                                                    + id
                                    )
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            department =
                    departmentRepository
                            .findByIdAndOrganizationId(
                                    id,
                                    organization.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Department not found with id : "
                                                    + id
                                    )
                            );
        }


        // ==========================================
        // DUPLICATE CODE
        // ==========================================

        if (!department.getDepartmentCode()
                .equals(request.getDepartmentCode())) {

            boolean exists;

            if (isAdmin()) {

                exists =
                        departmentRepository
                                .existsByDepartmentCode(
                                        request.getDepartmentCode()
                                );

            } else {

                Organization organization =
                        getCurrentUserOrganization(
                                getCurrentUser()
                        );

                exists =
                        departmentRepository
                                .existsByDepartmentCodeAndOrganizationId(
                                        request.getDepartmentCode(),
                                        organization.getId()
                                );
            }

            if (exists) {

                throw new DuplicateResourceException(
                        "Department code already exists."
                );
            }
        }


        // ==========================================
        // DUPLICATE NAME
        // ==========================================

        if (!department.getDepartmentName()
                .equals(request.getDepartmentName())) {

            boolean exists;

            if (isAdmin()) {

                exists =
                        departmentRepository
                                .existsByDepartmentName(
                                        request.getDepartmentName()
                                );

            } else {

                Organization organization =
                        getCurrentUserOrganization(
                                getCurrentUser()
                        );

                exists =
                        departmentRepository
                                .existsByDepartmentNameAndOrganizationId(
                                        request.getDepartmentName(),
                                        organization.getId()
                                );
            }

            if (exists) {

                throw new DuplicateResourceException(
                        "Department name already exists."
                );
            }
        }


        // ==========================================
        // UPDATE
        // ==========================================

        department.setDepartmentCode(
                request.getDepartmentCode()
        );

        department.setDepartmentName(
                request.getDepartmentName()
        );

        department.setDescription(
                request.getDescription()
        );


        Department updatedDepartment =
                departmentRepository.save(
                        department
                );

        return mapToResponse(
                updatedDepartment
        );
    }


    // ==========================================
    // DELETE DEPARTMENT
    // ==========================================

    @Override
    @PreAuthorize(
    "hasRole('ADMIN') or " +
    "@organizationAuthorizationService.isOrganizationOwner()"
)
    public void deleteDepartment(Long id) {

        Department department;

        if (isAdmin()) {

            department =
                    departmentRepository.findById(id)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Department not found with id : "
                                                    + id
                                    )
                            );

        } else {

            Organization organization =
                    getCurrentUserOrganization(
                            getCurrentUser()
                    );

            department =
                    departmentRepository
                            .findByIdAndOrganizationId(
                                    id,
                                    organization.getId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Department not found with id : "
                                                    + id
                                    )
                            );
        }

        departmentRepository.delete(
                department
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

    private Organization getCurrentUserOrganization(
        User user) {

    Organization organization = user.getOrganization();

    if (organization == null) {
        throw new ResourceNotFoundException(
                "You are not associated with an organization."
        );
    }

    return organization;
}


    // ==========================================
    // CHECK ADMIN
    // ==========================================

    private boolean isAdmin() {

        return getCurrentUser()
                .getRole() == Role.ADMIN;
    }


    // ==========================================
    // MAP ENTITY → RESPONSE
    // ==========================================

    private DepartmentResponse mapToResponse(
            Department department) {

        return DepartmentResponse.builder()
                .id(department.getId())
                .departmentCode(
                        department.getDepartmentCode()
                )
                .departmentName(
                        department.getDepartmentName()
                )
                .description(
                        department.getDescription()
                )
                .build();
    }
}