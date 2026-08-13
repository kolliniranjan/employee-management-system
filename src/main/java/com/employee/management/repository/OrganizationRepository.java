package com.employee.management.repository;

import com.employee.management.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository
        extends JpaRepository<Organization, Long> {

    Optional<Organization> findByOwnerId(Long ownerId);

    boolean existsByOwnerId(Long ownerId);
}