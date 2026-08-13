package com.employee.management.repository;

import com.employee.management.entity.OrganizationApplication;
import com.employee.management.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationApplicationRepository
        extends JpaRepository<OrganizationApplication, Long> {

    List<OrganizationApplication> findByStatus(
            ApplicationStatus status
    );

    List<OrganizationApplication> findByApplicantId(
            Long applicantId
    );

    boolean existsByApplicantIdAndStatus(
            Long applicantId,
            ApplicationStatus status
    );
}