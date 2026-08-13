package com.employee.management.controller;

import com.employee.management.dto.OrganizationApplicationRequest;
import com.employee.management.dto.OrganizationApplicationResponse;
import com.employee.management.entity.User;
import com.employee.management.service.OrganizationApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organization-applications")
@RequiredArgsConstructor
public class OrganizationApplicationController {

    private final OrganizationApplicationService applicationService;


    // ==========================================
    // USER - SUBMIT APPLICATION
    // ==========================================

    @PostMapping
    public ResponseEntity<OrganizationApplicationResponse>
    submitApplication(
            @Valid @RequestBody
            OrganizationApplicationRequest request,
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        OrganizationApplicationResponse response =
                applicationService.submitApplication(
                        user.getId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // ==========================================
    // USER - VIEW OWN APPLICATIONS
    // ==========================================

    @GetMapping("/my")
    public ResponseEntity<
            List<OrganizationApplicationResponse>>
    getMyApplications(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByUser(
                                user.getId()
                        )
        );
    }


    // ==========================================
    // ADMIN - VIEW ALL APPLICATIONS
    // ==========================================

    @GetMapping
    public ResponseEntity<
            List<OrganizationApplicationResponse>>
    getAllApplications() {

        return ResponseEntity.ok(
                applicationService
                        .getAllApplications()
        );
    }


    // ==========================================
    // ADMIN - VIEW PENDING APPLICATIONS
    // ==========================================

    @GetMapping("/pending")
    public ResponseEntity<
            List<OrganizationApplicationResponse>>
    getPendingApplications() {

        return ResponseEntity.ok(
                applicationService
                        .getPendingApplications()
        );
    }


    // ==========================================
    // ADMIN - APPROVE
    // ==========================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<
            OrganizationApplicationResponse>
    approveApplication(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                applicationService
                        .approveApplication(id)
        );
    }


    // ==========================================
    // ADMIN - REJECT
    // ==========================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<
            OrganizationApplicationResponse>
    rejectApplication(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                applicationService
                        .rejectApplication(id)
        );
    }
}