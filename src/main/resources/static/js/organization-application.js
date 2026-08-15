// ==========================================
// EMS - ORGANIZATION APPLICATION
// ==========================================

// ==========================================
// AUTH CHECK
// ==========================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ==========================================
// ELEMENTS
// ==========================================

const userEmail =
    document.getElementById("userEmail");

const userRole =
    document.getElementById("userRole");

const applicationForm =
    document.getElementById(
        "organizationApplicationForm"
    );

const submitButton =
    document.getElementById(
        "submitApplicationButton"
    );

const applicationError =
    document.getElementById(
        "applicationError"
    );

const applicationSuccess =
    document.getElementById(
        "applicationSuccess"
    );

const applicationStatusSection =
    document.getElementById(
        "applicationStatusSection"
    );

const applicationStatusCard =
    document.getElementById(
        "applicationStatusCard"
    );


// ==========================================
// GET JWT PAYLOAD
// ==========================================

function getTokenPayload() {

    try {

        const payload =
            JSON.parse(
                atob(
                    token
                        .split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

        return payload;

    } catch (error) {

        console.error(
            "Unable to read JWT:",
            error
        );

        return {};

    }

}


// ==========================================
// LOAD USER INFORMATION
// ==========================================

function loadUserInformation() {

    const payload =
        getTokenPayload();

    userEmail.textContent =
        payload.sub || "User";

    userRole.textContent =
        payload.role || "Authenticated";

}


// ==========================================
// HIDE MESSAGES
// ==========================================

function clearMessages() {

    applicationError.classList.add(
        "d-none"
    );

    applicationSuccess.classList.add(
        "d-none"
    );

}


// ==========================================
// SHOW ERROR
// ==========================================

function showError(message) {

    applicationError.textContent =
        message;

    applicationError.classList.remove(
        "d-none"
    );

    applicationSuccess.classList.add(
        "d-none"
    );

}


// ==========================================
// SHOW SUCCESS
// ==========================================

function showSuccess(message) {

    applicationSuccess.textContent =
        message;

    applicationSuccess.classList.remove(
        "d-none"
    );

    applicationError.classList.add(
        "d-none"
    );

}


// ==========================================
// STATUS BADGE
// ==========================================

function getStatusBadge(status) {

    switch (status) {

        case "APPROVED":

            return `
                <span class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i>
                    APPROVED
                </span>
            `;

        case "REJECTED":

            return `
                <span class="badge bg-danger">
                    <i class="bi bi-x-circle me-1"></i>
                    REJECTED
                </span>
            `;

        case "PENDING":

            return `
                <span class="badge bg-warning text-dark">
                    <i class="bi bi-clock me-1"></i>
                    PENDING
                </span>
            `;

        default:

            return `
                <span class="badge bg-secondary">
                    ${status || "UNKNOWN"}
                </span>
            `;
    }

}


// ==========================================
// DISPLAY APPLICATION STATUS
// ==========================================

// ==========================================
// DISPLAY APPLICATION HISTORY
// ==========================================

function displayApplicationHistory(applications) {

    if (!applications || applications.length === 0) {

        applicationStatusSection.classList.add("d-none");

        return;
    }

    applicationStatusSection.classList.remove("d-none");

    applicationStatusCard.innerHTML = `

        <div class="mb-3">

            <h6 class="fw-bold">
                <i class="bi bi-clock-history me-2"></i>
                Application History
            </h6>

            <small class="text-muted">
                All organization applications submitted by you
            </small>

        </div>

        ${applications.map(application => `

            <div class="border rounded p-3 mb-3">

                <div class="d-flex justify-content-between align-items-center mb-3">

                    <div>

                        <h6 class="mb-1 fw-bold">
                            ${application.organizationName}
                        </h6>

                        <small class="text-muted">
                            Application ID: #${application.id}
                        </small>

                    </div>

                    <div>
                        ${getStatusBadge(application.status)}
                    </div>

                </div>


                <div class="row g-3">

                    <div class="col-md-6">

                        <small class="text-muted">
                            Organization Type
                        </small>

                        <div class="fw-semibold">
                            ${application.organizationType}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <small class="text-muted">
                            Your Position
                        </small>

                        <div class="fw-semibold">
                            ${application.applicantPosition}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <small class="text-muted">
                            Contact Number
                        </small>

                        <div class="fw-semibold">
                            ${application.contactNumber}
                        </div>

                    </div>


                    <div class="col-md-6">

                        <small class="text-muted">
                            Applied At
                        </small>

                        <div class="fw-semibold">
                            ${formatDate(application.appliedAt)}
                        </div>

                    </div>


                    ${
                        application.reviewedAt
                        ? `
                            <div class="col-md-6">

                                <small class="text-muted">
                                    Reviewed At
                                </small>

                                <div class="fw-semibold">
                                    ${formatDate(application.reviewedAt)}
                                </div>

                            </div>
                        `
                        : ""
                    }


                    ${
                        application.reason
                        ? `
                            <div class="col-12">

                                <small class="text-muted">
                                    Reason
                                </small>

                                <div class="mt-1">
                                    ${application.reason}
                                </div>

                            </div>
                        `
                        : ""
                    }

                </div>

            </div>

        `).join("")}

    `;
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    try {

        return new Date(
            dateValue
        ).toLocaleString("en-IN");

    } catch (error) {

        return dateValue;
    }

}


// ==========================================
// LOAD MY APPLICATION
// ==========================================

async function loadMyApplication() {

    try {

        const data =
            await apiGet(
                "/organization-applications/my"
            );

        if (!data) {
            return;
        }

        const applications =
            Array.isArray(data)
                ? data
                : [];

        if (applications.length === 0) {

            applicationStatusSection.classList.add(
                "d-none"
            );

            return;
        }

        displayApplicationHistory(
            applications
        );

    } catch (error) {

        console.error(
            "Unable to load applications:",
            error
        );

        showError(
            error.message ||
            "Unable to load application history."
        );

    }

}

// ==========================================
// SUBMIT APPLICATION
// ==========================================

applicationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessages();


        // ======================================
        // READ FORM VALUES
        // ======================================

        const organizationName =
            document
                .getElementById(
                    "organizationName"
                )
                .value
                .trim();


        const organizationType =
            document
                .getElementById(
                    "organizationType"
                )
                .value;


        const applicantPosition =
            document
                .getElementById(
                    "applicantPosition"
                )
                .value
                .trim();


        const contactNumber =
            document
                .getElementById(
                    "contactNumber"
                )
                .value
                .trim();


        const reason =
            document
                .getElementById(
                    "reason"
                )
                .value
                .trim();


        // ======================================
        // BASIC VALIDATION
        // ======================================

        if (!organizationName) {

            showError(
                "Organization name is required."
            );

            return;
        }


        if (!organizationType) {

            showError(
                "Please select an organization type."
            );

            return;
        }


        if (!applicantPosition) {

            showError(
                "Applicant position is required."
            );

            return;
        }


        if (!contactNumber) {

            showError(
                "Contact number is required."
            );

            return;
        }


        // ======================================
        // REQUEST BODY
        // ======================================

        const applicationData = {

            organizationName:
                organizationName,

            organizationType:
                organizationType,

            applicantPosition:
                applicantPosition,

            contactNumber:
                contactNumber,

            reason:
                reason || null

        };


        // ======================================
        // BUTTON LOADING
        // ======================================

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-1">
            </span>
            Submitting...
        `;


        try {

            // ==================================
            // POST APPLICATION
            // ==================================

            const data =
                await apiPost(
                    "/organization-applications",
                    applicationData
                );


            // ==================================
            // SUCCESS
            // ==================================

            showSuccess(
                "Organization application submitted successfully."
            );


            // Display returned application

            if (data) {

    await loadMyApplication();

}


            // Reset form

            applicationForm.reset();


        } catch (error) {

            console.error(
                "Application submission failed:",
                error
            );


            showError(
                error.message ||
                "Unable to submit organization application."
            );


        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML = `
                <i class="bi bi-send me-1"></i>
                Submit Application
            `;

        }

    }
);


// ==========================================
// LOGOUT
// ==========================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            logout();

        }
    );

}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );

if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        function () {

            document
                .getElementById("sidebar")
                .classList.toggle("show");

        }
    );

}


// ==========================================
// INITIALIZE
// ==========================================

async function initializePage() {

    loadUserInformation();

    await loadMyApplication();

}

initializePage();