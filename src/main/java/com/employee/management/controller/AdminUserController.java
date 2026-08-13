package com.employee.management.controller;

import com.employee.management.dto.UserResponse;
import com.employee.management.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;


    // ==========================================
    // ASSIGN USER TO ORGANIZATION
    // ==========================================

    @PutMapping("/{userId}/organization/{organizationId}")
    public ResponseEntity<UserResponse> assignUserToOrganization(
            @PathVariable Long userId,
            @PathVariable Long organizationId) {

        return ResponseEntity.ok(
                adminUserService.assignUserToOrganization(
                        userId,
                        organizationId
                )
        );
    }


    // ==========================================
    // REMOVE USER FROM ORGANIZATION
    // ==========================================

    @DeleteMapping("/{userId}/organization")
    public ResponseEntity<Void> removeUserFromOrganization(
            @PathVariable Long userId) {

        adminUserService.removeUserFromOrganization(userId);

        return ResponseEntity.noContent().build();
    }


    // ==========================================
    // GET USERS BY ORGANIZATION
    // ==========================================

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<UserResponse>>
    getUsersByOrganization(
            @PathVariable Long organizationId) {

        return ResponseEntity.ok(
                adminUserService.getUsersByOrganization(
                        organizationId
                )
        );
    }
}