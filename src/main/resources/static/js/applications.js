// ==========================================
// ORGANIZATION APPLICATIONS - ADMIN
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

const userEmail =
    document.getElementById("userEmail");

const userRole =
    document.getElementById("userRole");

const totalApplications =
    document.getElementById("totalApplications");

const pendingApplications =
    document.getElementById("pendingApplications");

const approvedApplications =
    document.getElementById("approvedApplications");

const rejectedApplications =
    document.getElementById("rejectedApplications");

const statusFilter =
    document.getElementById("statusFilter");

const loadingMessage =
    document.getElementById("loadingMessage");

const applicationError =
    document.getElementById("applicationError");

const applicationSuccess =
    document.getElementById("applicationSuccess");

const applicationTableContainer =
    document.getElementById(
        "applicationTableContainer"
    );

const applicationTableBody =
    document.getElementById(
        "applicationTableBody"
    );

const applicationDetailsBody =
    document.getElementById(
        "applicationDetailsBody"
    );


// ==========================================
// STORE APPLICATIONS
// ==========================================

let applications = [];


// ==========================================
// JWT PAYLOAD
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


// ==========================================
// LOAD USER INFORMATION
// ==========================================

function loadUserInformation() {

    const payload =
        getTokenPayload();

    if (!payload) {
        return;
    }

    userEmail.textContent =
        payload.sub || "User";

    userRole.textContent =
        payload.role || "Authenticated User";
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
    // AUTHENTICATION / AUTHORIZATION ERROR
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
// LOAD ALL APPLICATIONS
// ==========================================

async function loadApplications() {

    try {

        showLoading();

        hideMessages();


        const response =
            await apiRequest(
                "/api/organization-applications"
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


        applications =
            Array.isArray(data)
                ? data
                : [];


        updateStatistics();

        renderApplications();


    } catch (error) {

        console.error(
            "Load applications error:",
            error
        );

        showError(
            error.message ||
            "Unable to load applications."
        );


    } finally {

        hideLoading();

    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        applications.length;


    const pending =
        applications.filter(
            application =>
                application.status === "PENDING"
        ).length;


    const approved =
        applications.filter(
            application =>
                application.status === "APPROVED"
        ).length;


    const rejected =
        applications.filter(
            application =>
                application.status === "REJECTED"
        ).length;


    totalApplications.textContent =
        total;

    pendingApplications.textContent =
        pending;

    approvedApplications.textContent =
        approved;

    rejectedApplications.textContent =
        rejected;
}


// ==========================================
// RENDER APPLICATIONS
// ==========================================

function renderApplications() {

    applicationTableBody.innerHTML = "";


    const selectedStatus =
        statusFilter.value;


    let filteredApplications =
        applications;


    if (selectedStatus !== "ALL") {

        filteredApplications =
            applications.filter(
                application =>
                    application.status ===
                    selectedStatus
            );
    }


    // ======================================
    // NO APPLICATIONS
    // ======================================

    if (
        filteredApplications.length === 0
    ) {

        applicationTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted py-5">

                    <i
                        class="bi bi-inbox fs-2 d-block mb-2">
                    </i>

                    No applications found.

                </td>

            </tr>

        `;

        applicationTableContainer.classList.remove(
            "d-none"
        );

        return;
    }


    // ======================================
    // APPLICATION ROWS
    // ======================================

    filteredApplications.forEach(
        application => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHtml(
                            application.organizationName
                        )}
                    </strong>

                    <small
                        class="d-block text-muted">

                        ${escapeHtml(
                            application.organizationType
                        )}

                    </small>

                </td>


                <td>

                    <strong>
                        ${escapeHtml(
                            application.applicantName
                        )}
                    </strong>

                    <small
                        class="d-block text-muted">

                        ${escapeHtml(
                            application.applicantEmail
                        )}

                    </small>

                </td>


                <td>
                    ${escapeHtml(
                        application.applicantPosition
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        application.organizationType
                    )}
                </td>


                <td>
                    ${getStatusBadge(
                        application.status
                    )}
                </td>


                <td>

                    <small>
                        ${formatDate(
                            application.appliedAt
                        )}
                    </small>

                </td>


                <td>

                    <div
                        class="d-flex gap-2">

                        <button
                            class="btn btn-sm btn-outline-primary"
                            onclick="viewApplication(
                                ${application.id}
                            )">

                            <i
                                class="bi bi-eye">
                            </i>

                        </button>


                        ${
                            application.status ===
                            "PENDING"

                            ? `

                                <button
                                    class="btn btn-sm btn-outline-success"
                                    onclick="approveApplication(
                                        ${application.id}
                                    )">

                                    <i
                                        class="bi bi-check-lg">
                                    </i>

                                </button>


                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    onclick="rejectApplication(
                                        ${application.id}
                                    )">

                                    <i
                                        class="bi bi-x-lg">
                                    </i>

                                </button>

                              `

                            : ""
                        }

                    </div>

                </td>

            `;


            applicationTableBody.appendChild(
                row
            );

        }
    );


    applicationTableContainer.classList.remove(
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


        default:

            return `
                <span class="badge bg-warning text-dark">
                    <i class="bi bi-hourglass-split me-1"></i>
                    PENDING
                </span>
            `;
    }
}


// ==========================================
// VIEW APPLICATION
// ==========================================

function viewApplication(id) {

    const application =
        applications.find(
            item =>
                item.id === id
        );


    if (!application) {
        return;
    }


    applicationDetailsBody.innerHTML = `

        <div class="row g-3">


            <div class="col-md-6">

                <label class="text-muted small">
                    Organization Name
                </label>

                <div class="fw-semibold">
                    ${escapeHtml(
                        application.organizationName
                    )}
                </div>

            </div>


            <div class="col-md-6">

                <label class="text-muted small">
                    Organization Type
                </label>

                <div class="fw-semibold">
                    ${escapeHtml(
                        application.organizationType
                    )}
                </div>

            </div>


            <div class="col-md-6">

                <label class="text-muted small">
                    Applicant
                </label>

                <div class="fw-semibold">
                    ${escapeHtml(
                        application.applicantName
                    )}
                </div>

            </div>


            <div class="col-md-6">

                <label class="text-muted small">
                    Email
                </label>

                <div class="fw-semibold">
                    ${escapeHtml(
                        application.applicantEmail
                    )}
                </div>

            </div>


            <div class="col-md-6">

                <label class="text-muted small">
                    Position
                </label>

                <div class="fw-semibold">
                    ${escapeHtml(
                        application.applicantPosition
                    )}
                </div>

            </div>


            <div class="col-md-6">

                <label class="text-muted small">
                    Contact Number
                </label>

                <div class="fw-semibold">
                    ${escapeHtml(
                        application.contactNumber
                    )}
                </div>

            </div>


            <div class="col-md-6">

                <label class="text-muted small">
                    Status
                </label>

                <div>
                    ${getStatusBadge(
                        application.status
                    )}
                </div>

            </div>


            <div class="col-md-6">

                <label class="text-muted small">
                    Applied At
                </label>

                <div class="fw-semibold">
                    ${formatDate(
                        application.appliedAt
                    )}
                </div>

            </div>


            <div class="col-12">

                <label class="text-muted small">
                    Reason
                </label>

                <div
                    class="border rounded p-3 mt-1">

                    ${
                        application.reason
                            ? escapeHtml(
                                application.reason
                              )
                            : "No reason provided."
                    }

                </div>

            </div>


            ${
                application.reviewedAt

                    ? `

                        <div class="col-12">

                            <label class="text-muted small">
                                Reviewed At
                            </label>

                            <div class="fw-semibold">
                                ${formatDate(
                                    application.reviewedAt
                                )}
                            </div>

                        </div>

                      `

                    : ""
            }

        </div>

    `;


    const modalElement =
        document.getElementById(
            "applicationDetailsModal"
        );


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();
}


// ==========================================
// APPROVE APPLICATION
// ==========================================

async function approveApplication(id) {

    const application =
        applications.find(
            item =>
                item.id === id
        );


    if (!application) {
        return;
    }


    const confirmed =
        confirm(
            `Approve the organization application from ${application.applicantName}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        hideMessages();


        const response =
            await apiRequest(
                `/api/organization-applications/${id}/approve`,
                {
                    method: "PUT"
                }
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
                "Unable to approve application."
            );
        }


        showSuccess(
            "Application approved successfully."
        );


        await loadApplications();


    } catch (error) {

        console.error(
            "Approve application error:",
            error
        );


        showError(
            error.message ||
            "Unable to approve application."
        );
    }
}


// ==========================================
// REJECT APPLICATION
// ==========================================

async function rejectApplication(id) {

    const application =
        applications.find(
            item =>
                item.id === id
        );


    if (!application) {
        return;
    }


    const confirmed =
        confirm(
            `Reject the organization application from ${application.applicantName}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        hideMessages();


        const response =
            await apiRequest(
                `/api/organization-applications/${id}/reject`,
                {
                    method: "PUT"
                }
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
                "Unable to reject application."
            );
        }


        showSuccess(
            "Application rejected successfully."
        );


        await loadApplications();


    } catch (error) {

        console.error(
            "Reject application error:",
            error
        );


        showError(
            error.message ||
            "Unable to reject application."
        );
    }
}


// ==========================================
// STATUS FILTER
// ==========================================

statusFilter.addEventListener(
    "change",
    function () {

        renderApplications();

    }
);


// ==========================================
// DATE FORMAT
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
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    loadingMessage.classList.remove(
        "d-none"
    );

    applicationTableContainer.classList.add(
        "d-none"
    );
}


function hideLoading() {

    loadingMessage.classList.add(
        "d-none"
    );
}


// ==========================================
// MESSAGES
// ==========================================

function showError(message) {

    applicationError.textContent =
        message;

    applicationError.classList.remove(
        "d-none"
    );
}


function showSuccess(message) {

    applicationSuccess.textContent =
        message;

    applicationSuccess.classList.remove(
        "d-none"
    );
}


function hideMessages() {

    applicationError.classList.add(
        "d-none"
    );

    applicationSuccess.classList.add(
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

loadApplications();