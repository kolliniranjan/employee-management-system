package com.employee.management.service.impl;

import com.employee.management.dto.ChangePasswordRequest;
import com.employee.management.dto.UserProfileResponse;
import com.employee.management.entity.Organization;
import com.employee.management.entity.User;
import com.employee.management.exception.InvalidRequestException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.UserRepository;
import com.employee.management.service.ProfileService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;


    // ==========================================
    // GET CURRENT USER PROFILE
    // ==========================================

    @Override
    public UserProfileResponse getCurrentUserProfile() {

        User user = getCurrentUser();

        Organization organization =
                user.getOrganization();


        return UserProfileResponse.builder()

                .id(
                        user.getId()
                )

                .firstName(
                        user.getFirstName()
                )

                .lastName(
                        user.getLastName()
                )

                .email(
                        user.getEmail()
                )

                .role(
                        user.getRole()
                )

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

                .organizationType(
                        organization != null
                                ? organization.getType()
                                : null
                )

                .build();
    }


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    @Override
    @Transactional
    public void changePassword(
            ChangePasswordRequest request) {

        User user = getCurrentUser();


        // ==========================================
        // CHECK NEW PASSWORD CONFIRMATION
        // ==========================================

        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new InvalidRequestException(
                    "New passwords do not match."
            );
        }


        // ==========================================
        // CHECK CURRENT PASSWORD
        // ==========================================

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new InvalidRequestException(
                    "Current password is incorrect."
            );
        }


        // ==========================================
        // PREVENT SAME PASSWORD
        // ==========================================

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            throw new InvalidRequestException(
                    "New password must be different from current password."
            );
        }


        // ==========================================
        // ENCODE NEW PASSWORD
        // ==========================================

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );


        // ==========================================
        // SAVE USER
        // ==========================================

        userRepository.save(user);
    }


    // ==========================================
    // GET AUTHENTICATED USER
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
}