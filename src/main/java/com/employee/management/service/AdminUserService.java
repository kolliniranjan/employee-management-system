package com.employee.management.service;

import com.employee.management.dto.UserResponse;
import com.employee.management.entity.User;

import java.util.List;

public interface AdminUserService {

    UserResponse assignUserToOrganization(
        Long userId,
        Long organizationId
);

    void removeUserFromOrganization(
            Long userId
    );

    List<UserResponse> getUsersByOrganization(
        Long organizationId
);
}