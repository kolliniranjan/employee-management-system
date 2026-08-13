package com.employee.management.controller;

import com.employee.management.entity.Organization;
import com.employee.management.entity.User;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationRepository organizationRepository;


    // ==========================================
    // GET MY ORGANIZATION
    // ==========================================

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyOrganization(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        Organization organization =
                organizationRepository
                        .findByOwnerId(user.getId())
                        .orElse(null);


        Map<String, Object> response =
                new HashMap<>();


        // ==========================================
        // USER DOES NOT OWN AN ORGANIZATION
        // ==========================================

        if (organization == null) {

            response.put(
                    "hasOrganization",
                    false
            );

            response.put(
                    "isOwner",
                    false
            );

            response.put(
                    "organization",
                    null
            );

            return ResponseEntity.ok(response);
        }


        // ==========================================
        // USER OWNS ORGANIZATION
        // ==========================================

        response.put(
                "hasOrganization",
                true
        );

        response.put(
                "isOwner",
                true
        );

        Map<String, Object> organizationData =
                new HashMap<>();

        organizationData.put(
                "id",
                organization.getId()
        );

        organizationData.put(
                "name",
                organization.getName()
        );

        organizationData.put(
                "type",
                organization.getType()
        );

        organizationData.put(
                "ownerId",
                organization.getOwner().getId()
        );

        response.put(
                "organization",
                organizationData
        );

        return ResponseEntity.ok(response);
    }
}