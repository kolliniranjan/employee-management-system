package com.employee.management.dto;

import com.employee.management.entity.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private Role role;

    private Long organizationId;

    private String organizationName;

    private String organizationType;
}