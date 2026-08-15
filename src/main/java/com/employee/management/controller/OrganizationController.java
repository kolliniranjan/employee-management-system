package com.employee.management.controller;

import com.employee.management.dto.OrganizationResponse;
import com.employee.management.dto.OrganizationUpdateRequest;
import com.employee.management.entity.Organization;
import com.employee.management.entity.User;
import com.employee.management.service.OrganizationService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;


    // ==========================================
    // GET MY ORGANIZATION
    // ==========================================

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyOrganization(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        Organization organization =
                organizationService.getMyOrganization(user);


        Map<String, Object> response =
                new HashMap<>();

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

        organizationData.put(
                "createdAt",
                organization.getCreatedAt()
        );


        response.put(
                "organization",
                organizationData
        );


        return ResponseEntity.ok(response);
    }


    // ==========================================
    // UPDATE MY ORGANIZATION
    // ==========================================

    @PutMapping("/my")
    public ResponseEntity<Map<String, Object>>
    updateMyOrganization(
            Authentication authentication,
            @Valid @RequestBody OrganizationUpdateRequest request) {

        User user =
                (User) authentication.getPrincipal();


        Organization organization =
                organizationService.updateMyOrganization(
                        user,
                        request
                );


        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "message",
                "Organization updated successfully."
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

        organizationData.put(
                "createdAt",
                organization.getCreatedAt()
        );


        response.put(
                "organization",
                organizationData
        );


        return ResponseEntity.ok(response);
    }


    // ==========================================
    // GET ALL ORGANIZATIONS - ADMIN
    // ==========================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrganizationResponse>>
    getAllOrganizations() {

        return ResponseEntity.ok(
                organizationService.getAllOrganizations()
        );
    }
}