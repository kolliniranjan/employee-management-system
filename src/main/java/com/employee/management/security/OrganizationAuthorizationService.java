package com.employee.management.security;

import com.employee.management.entity.User;
import com.employee.management.repository.OrganizationRepository;
import com.employee.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("organizationAuthorizationService")
@RequiredArgsConstructor
public class OrganizationAuthorizationService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    // ==========================================
    // CHECK ORGANIZATION OWNER
    // ==========================================

    public boolean isOrganizationOwner() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return false;
        }

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return false;
        }

        return organizationRepository
                .existsByOwnerId(user.getId());
    }
}