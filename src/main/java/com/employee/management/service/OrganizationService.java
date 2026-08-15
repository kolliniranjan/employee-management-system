package com.employee.management.service;

import com.employee.management.dto.OrganizationResponse;
import com.employee.management.dto.OrganizationUpdateRequest;
import com.employee.management.entity.Organization;
import com.employee.management.entity.User;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.OrganizationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;


    // ==========================================
    // GET MY ORGANIZATION
    // ==========================================

    @Transactional(readOnly = true)
    public Organization getMyOrganization(User user) {

        return organizationRepository
                .findByOwnerId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Organization not found."
                        )
                );
    }


    // ==========================================
    // UPDATE MY ORGANIZATION
    // ==========================================

    @Transactional
    public Organization updateMyOrganization(
            User user,
            OrganizationUpdateRequest request) {

        Organization organization =
                getMyOrganization(user);

        organization.setName(
                request.getName().trim()
        );

        organization.setType(
                request.getType().trim()
        );

        return organizationRepository.save(
                organization
        );
    }


    // ==========================================
    // GET ALL ORGANIZATIONS - ADMIN
    // ==========================================

    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizations() {

        return organizationRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // MAP ENTITY → RESPONSE
    // ==========================================

    private OrganizationResponse mapToResponse(
            Organization organization) {

        User owner =
                organization.getOwner();

        String ownerName = null;

        if (owner != null) {

            ownerName =
                    (owner.getFirstName()
                            + " "
                            + owner.getLastName())
                            .trim();
        }

        return OrganizationResponse.builder()

                .id(
                        organization.getId()
                )

                .name(
                        organization.getName()
                )

                .type(
                        organization.getType()
                )

                .ownerId(
                        owner != null
                                ? owner.getId()
                                : null
                )

                .ownerName(
                        ownerName
                )

                .ownerEmail(
                        owner != null
                                ? owner.getEmail()
                                : null
                )

                .createdAt(
                        organization.getCreatedAt()
                )

                .build();
    }
}