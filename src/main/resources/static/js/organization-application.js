// ==========================================
// ORGANIZATION APPLICATION
// ==========================================

const token = localStorage.getItem("token");


// ==========================================
// AUTHENTICATION CHECK
// ==========================================

if (!token) {

    window.location.href = "login.html";

}


// ==========================================
// ELEMENTS
// ==========================================

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

const statusSection =
    document.getElementById(
        "applicationStatusSection"
    );

const statusCard =
    document.getElementById(
        "applicationStatusCard"
    );

const userEmail =
    document.getElementById(
        "userEmail"
    );

const userRole =
    document.getElementById(
        "userRole"
    );


// ==========================================
// GET USER INFORMATION FROM JWT
// ==========================================

function getTokenPayload() {

    try {

        return JSON.parse(
            atob(
                token
                    .split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

    } catch (error) {

        console.error(
            "Unable to read JWT:",
            error
        );

        return null;

    }

}


function loadUserInformation() {

    const payload =
        getTokenPayload();

    if (!payload) {
        return;
    }

    userEmail.textContent =
        payload.sub || "User";

    userRole.textContent =
        payload.role ||
        "Authenticated User";

}


// ==========================================
// AUTHORIZED API REQUEST
// ==========================================

async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                }

            }
        );


    // ======================================
    // AUTHENTICATION ERROR
    // ======================================

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        localStorage.removeItem("token");
        localStorage.removeItem("tokenType");

        window.location.href =
            "login.html";

        return null;

    }


    return response;

}


// ==========================================
// SUBMIT APPLICATION
// ==========================================

applicationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Clear previous messages

        applicationError.classList.add(
            "d-none"
        );

        applicationSuccess.classList.add(
            "d-none"
        );


        // ======================================
        // GET FORM VALUES
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
        // CLIENT-SIDE VALIDATION
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
                "Your position is required."
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
        // DISABLE BUTTON
        // ======================================

        submitButton.disabled = true;

        submitButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2">
            </span>

            Submitting...
        `;


        // ======================================
        // REQUEST BODY
        // ======================================

        const requestBody = {

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


        try {

            const response =
                await apiRequest(
                    "/api/organization-applications",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                requestBody
                            )
                    }
                );


            if (!response) {
                return;
            }


            const data =
                await response
                    .json()
                    .catch(() => null);


            // ==================================
            // BACKEND ERROR
            // ==================================

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to submit application."
                );

            }


            // ==================================
            // SUCCESS
            // ==================================

            applicationSuccess.textContent =
                "Application submitted successfully. Your application is now pending review.";

            applicationSuccess.classList.remove(
                "d-none"
            );


            // Clear form

            applicationForm.reset();


            // Display returned application

            renderApplicationStatus(
                data
            );


        } catch (error) {

            console.error(
                "Application submission error:",
                error
            );


            showError(
                error.message ||
                "Unable to submit application."
            );


        } finally {

            submitButton.disabled =
                false;

            submitButton.innerHTML = `
                <i class="bi bi-send me-1"></i>
                Submit Application
            `;

        }

    }
);


// ==========================================
// LOAD MY APPLICATIONS
// ==========================================

async function loadMyApplications() {

    try {

        const response =
            await apiRequest(
                "/api/organization-applications/my"
            );


        if (!response) {
            return;
        }


        const data =
            await response
                .json()
                .catch(() => null);


        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Unable to load applications."
            );

        }


        if (
            Array.isArray(data) &&
            data.length > 0
        ) {

            // Show the latest application

            const latestApplication =
                data[data.length - 1];

            renderApplicationStatus(
                latestApplication
            );

        }


    } catch (error) {

        console.error(
            "Unable to load applications:",
            error
        );

    }

}


// ==========================================
// RENDER APPLICATION STATUS
// ==========================================

function renderApplicationStatus(
    application
) {

    if (!application) {
        return;
    }


    const status =
        application.status ||
        "PENDING";


    let badgeClass =
        "bg-warning text-dark";

    let icon =
        "bi-hourglass-split";

    let message =
        "Your application is waiting for administrator review.";


    if (status === "APPROVED") {

        badgeClass =
            "bg-success";

        icon =
            "bi-check-circle-fill";

        message =
            "Your organization application has been approved.";

    }


    if (status === "REJECTED") {

        badgeClass =
            "bg-danger";

        icon =
            "bi-x-circle-fill";

        message =
            "Your organization application has been rejected.";

    }


    statusCard.innerHTML = `

        <div
            class="d-flex align-items-center mb-3">

            <i
                class="bi ${icon} fs-3 me-3">
            </i>

            <div>

                <h6 class="mb-1">
                    ${application.organizationName}
                </h6>

                <span
                    class="badge ${badgeClass}">

                    ${status}

                </span>

            </div>

        </div>


        <p class="mb-2">

            ${message}

        </p>


        <div class="small text-muted">

            <div>
                <strong>Organization Type:</strong>
                ${application.organizationType || "-"}
            </div>

            <div>
                <strong>Position:</strong>
                ${application.applicantPosition || "-"}
            </div>

            <div>
                <strong>Applied:</strong>
                ${formatDate(application.appliedAt)}
            </div>

        </div>

    `;


    statusSection.classList.remove(
        "d-none"
    );

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
        ).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch (error) {

        return dateValue;

    }

}


// ==========================================
// ERROR MESSAGE
// ==========================================

function showError(message) {

    applicationError.textContent =
        message;

    applicationError.classList.remove(
        "d-none"
    );

}


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

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "tokenType"
            );

            window.location.href =
                "login.html";

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

            const sidebar =
                document.getElementById(
                    "sidebar"
                );

            if (sidebar) {

                sidebar.classList.toggle(
                    "show"
                );

            }

        }
    );

}


// ==========================================
// INITIALIZE
// ==========================================

loadUserInformation();

loadMyApplications();