package com.employee.management.service;

import com.employee.management.dto.ChangePasswordRequest;
import com.employee.management.dto.UserProfileResponse;

public interface ProfileService {

    UserProfileResponse getCurrentUserProfile();

    void changePassword(
            ChangePasswordRequest request
    );
}