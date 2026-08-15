package com.employee.management.service;

import com.employee.management.entity.Organization;
import com.employee.management.repository.OrganizationRepository;
import com.employee.management.dto.OrganizationApplicationRequest;
import com.employee.management.dto.OrganizationApplicationResponse;
import com.employee.management.entity.OrganizationApplication;
import com.employee.management.entity.User;
import com.employee.management.entity.enums.ApplicationStatus;
import com.employee.management.repository.OrganizationApplicationRepository;
import com.employee.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.employee.management.entity.enums.Role;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationApplicationService {

    private final OrganizationApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;


    // ==========================================
    // SUBMIT APPLICATION
    // ==========================================

    @Transactional
    public OrganizationApplicationResponse submitApplication(
            Long userId,
            OrganizationApplicationRequest request) {

        User applicant =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));


        // Prevent duplicate pending applications

        boolean alreadyPending =
                applicationRepository
                        .existsByApplicantIdAndStatus(
                                userId,
                                ApplicationStatus.PENDING
                        );

        if (alreadyPending) {

            throw new IllegalStateException(
                    "You already have a pending organization application"
            );
        }


        OrganizationApplication application =
                OrganizationApplication.builder()
                        .organizationName(
                                request.getOrganizationName()
                        )
                        .organizationType(
                                request.getOrganizationType()
                        )
                        .applicantPosition(
                                request.getApplicantPosition()
                        )
                        .contactNumber(
                                request.getContactNumber()
                        )
                        .reason(
                                request.getReason()
                        )
                        .status(
                                ApplicationStatus.PENDING
                        )
                        .applicant(applicant)
                        .appliedAt(
                                LocalDateTime.now()
                        )
                        .build();


        OrganizationApplication saved =
                applicationRepository.save(
                        application
                );


        return mapToResponse(saved);
    }


    // ==========================================
    // GET USER APPLICATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<OrganizationApplicationResponse>
    getApplicationsByUser(Long userId) {

        return applicationRepository
                .findByApplicantId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // GET ALL APPLICATIONS - ADMIN
    // ==========================================

    @Transactional(readOnly = true)
    public List<OrganizationApplicationResponse>
    getAllApplications() {

        return applicationRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // GET PENDING APPLICATIONS - ADMIN
    // ==========================================

    @Transactional(readOnly = true)
    public List<OrganizationApplicationResponse>
    getPendingApplications() {

        return applicationRepository
                .findByStatus(
                        ApplicationStatus.PENDING
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ==========================================
    // APPROVE APPLICATION
    // ==========================================

    @Transactional
    public OrganizationApplicationResponse
    approveApplication(Long applicationId) {

        OrganizationApplication application =
                findApplication(applicationId);


        // ==========================================
        // ONLY PENDING APPLICATIONS CAN BE APPROVED
        // ==========================================

        if (application.getStatus() !=
                ApplicationStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending applications can be approved"
            );
        }


        User applicant =
                application.getApplicant();


        // ==========================================
        // PREVENT DUPLICATE ORGANIZATION
        // ==========================================

        if (organizationRepository
                .existsByOwnerId(applicant.getId())) {

            throw new IllegalStateException(
                    "This user already owns an organization"
            );
        }


        // ==========================================
        // CREATE ORGANIZATION
        // ==========================================

        Organization organization =
                Organization.builder()
                        .name(
                                application.getOrganizationName()
                        )
                        .type(
                                application.getOrganizationType()
                        )
                        .owner(applicant)
                        .createdAt(
                                LocalDateTime.now()
                        )
                        .build();


        organizationRepository.save(
                organization
        );


        // ==========================================
// ASSIGN APPLICANT TO NEW ORGANIZATION
// ==========================================

applicant.setOrganization(organization);

// Approved organization applicant becomes EMPLOYEE
applicant.setRole(Role.EMPLOYEE);

userRepository.save(applicant);


        // ==========================================
        // UPDATE APPLICATION STATUS
        // ==========================================

        application.setStatus(
                ApplicationStatus.APPROVED
        );

        application.setReviewedAt(
                LocalDateTime.now()
        );


        OrganizationApplication updated =
                applicationRepository.save(
                        application
                );


        return mapToResponse(updated);
    }


    // ==========================================
    // REJECT APPLICATION
    // ==========================================

    @Transactional
    public OrganizationApplicationResponse
    rejectApplication(Long applicationId) {

        OrganizationApplication application =
                findApplication(applicationId);


        if (application.getStatus() !=
                ApplicationStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending applications can be rejected"
            );
        }


        application.setStatus(
                ApplicationStatus.REJECTED
        );

        application.setReviewedAt(
                LocalDateTime.now()
        );


        OrganizationApplication updated =
                applicationRepository.save(
                        application
                );


        return mapToResponse(updated);
    }


    // ==========================================
    // FIND APPLICATION
    // ==========================================

    private OrganizationApplication
    findApplication(Long applicationId) {

        return applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Organization application not found"
                        )
                );
    }


    // ==========================================
    // ENTITY → RESPONSE DTO
    // ==========================================

    private OrganizationApplicationResponse
    mapToResponse(
            OrganizationApplication application) {

        User applicant =
                application.getApplicant();


        String applicantName =
                (
                        applicant.getFirstName() +
                        " " +
                        applicant.getLastName()
                ).trim();


        return OrganizationApplicationResponse
                .builder()

                .id(
                        application.getId()
                )

                .organizationName(
                        application.getOrganizationName()
                )

                .organizationType(
                        application.getOrganizationType()
                )

                .applicantPosition(
                        application.getApplicantPosition()
                )

                .contactNumber(
                        application.getContactNumber()
                )

                .reason(
                        application.getReason()
                )

                .status(
                        application.getStatus()
                )

                .applicantId(
                        applicant.getId()
                )

                .applicantName(
                        applicantName
                )

                .applicantEmail(
                        applicant.getEmail()
                )

                .appliedAt(
                        application.getAppliedAt()
                )

                .reviewedAt(
                        application.getReviewedAt()
                )

                .build();
    }
}