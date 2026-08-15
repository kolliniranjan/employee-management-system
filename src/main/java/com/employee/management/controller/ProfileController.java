package com.employee.management.controller;

import com.employee.management.dto.ChangePasswordRequest;
import com.employee.management.dto.UserProfileResponse;
import com.employee.management.service.ProfileService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;


    // ==========================================
    // GET MY PROFILE
    // ==========================================

    @GetMapping("/me")
    public UserProfileResponse getMyProfile() {

        return profileService.getCurrentUserProfile();
    }


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    @PutMapping("/change-password")
public ResponseEntity<Map<String, String>> changePassword(
        @Valid @RequestBody ChangePasswordRequest request) {

    profileService.changePassword(request);

    Map<String, String> response = new HashMap<>();

    response.put(
            "message",
            "Password changed successfully."
    );

    return ResponseEntity.ok(response);
}
}