package com.employee.management.service.impl;

import com.employee.management.dto.UserResponse;
import com.employee.management.entity.Organization;
import com.employee.management.entity.User;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.OrganizationRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;


    // ==========================================
    // ASSIGN USER TO ORGANIZATION
    // ==========================================

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse assignUserToOrganization(
            Long userId,
            Long organizationId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id : " + userId
                        )
                );

        Organization organization =
                organizationRepository.findById(organizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Organization not found with id : "
                                                + organizationId
                        )
                );

        user.setOrganization(organization);

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }


    // ==========================================
    // REMOVE USER FROM ORGANIZATION
    // ==========================================

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void removeUserFromOrganization(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id : " + userId
                        )
                );

        user.setOrganization(null);

        userRepository.save(user);
    }


    // ==========================================
    // GET USERS BY ORGANIZATION
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsersByOrganization(
            Long organizationId) {

        Organization organization =
                organizationRepository.findById(organizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Organization not found with id : "
                                                + organizationId
                        )
                );

        return userRepository
                .findByOrganizationId(organizationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // MAP USER → RESPONSE
    // ==========================================

    private UserResponse mapToResponse(User user) {

        Organization organization =
                user.getOrganization();

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .organizationId(
                        organization != null
                                ? organization.getId()
                                : null
                )
                .organizationName(
                        organization != null
                                ? organization.getName()
                                : null
                )
                .build();
    }
}