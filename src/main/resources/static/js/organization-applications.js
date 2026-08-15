// ==========================================
// ORGANIZATION APPLICATIONS - ADMIN
// ==========================================

const token = localStorage.getItem("token");


// ==========================================
// AUTH CHECK
// ==========================================

if (!token) {

    window.location.href = "login.html";

}


// ==========================================
// JWT ROLE
// ==========================================

function getUserRole() {

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

        return payload.role || "";

    } catch (error) {

        return "";

    }

}


const currentUserRole = getUserRole();

const isAdmin =
    currentUserRole === "ADMIN" ||
    currentUserRole === "ROLE_ADMIN";


// ==========================================
// ADMIN CHECK
// ==========================================

if (!isAdmin) {

    alert(
        "Access denied. Admin privileges required."
    );

    window.location.href =
        "dashboard.html";

}


// ==========================================
// ELEMENTS
// ==========================================

const userEmail =
    document.getElementById("userEmail");

const userRole =
    document.getElementById("userRole");

const loadingMessage =
    document.getElementById("loadingMessage");

const tableContainer =
    document.getElementById("tableContainer");

const applicationTableBody =
    document.getElementById(
        "applicationTableBody"
    );

const errorMessage =
    document.getElementById("errorMessage");

const statusFilter =
    document.getElementById("statusFilter");


// ==========================================
// LOAD USER INFORMATION
// ==========================================

function loadUserInformation() {

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

        userEmail.textContent =
            payload.sub || "Admin";

        userRole.textContent =
            payload.role || "ADMIN";

    } catch (error) {

        userEmail.textContent = "Admin";

        userRole.textContent = "ADMIN";

    }

}


// ==========================================
// LOAD APPLICATIONS
// ==========================================

async function loadApplications() {

    try {

        loadingMessage.classList.remove(
            "d-none"
        );

        tableContainer.classList.add(
            "d-none"
        );

        errorMessage.classList.add(
            "d-none"
        );


        const filter =
            statusFilter.value;


        let endpoint =
            "/organization-applications";


        if (filter === "PENDING") {

            endpoint =
                "/organization-applications/pending";

        }


        const data =
            await apiGet(endpoint);


        if (!data) {
            return;
        }


        let applications =
            Array.isArray(data)
                ? data
                : data.content || [];


        // Client-side filtering for approved/rejected
        if (
            filter === "APPROVED" ||
            filter === "REJECTED"
        ) {

            applications =
                applications.filter(
                    application =>
                        application.status === filter
                );

        }


        renderApplications(
            applications
        );


    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            error.message ||
            "Unable to load applications.";

        errorMessage.classList.remove(
            "d-none"
        );

    } finally {

        loadingMessage.classList.add(
            "d-none"
        );

    }

}


// ==========================================
// RENDER APPLICATIONS
// ==========================================

function renderApplications(
    applications
) {

    applicationTableBody.innerHTML = "";


    if (applications.length === 0) {

        applicationTableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-5">

                    <i
                        class="bi bi-inbox fs-1">
                    </i>

                    <p class="mt-2 mb-0">
                        No applications found
                    </p>

                </td>

            </tr>

        `;

    } else {

        applications.forEach(
            application => {

                const row =
                    document.createElement("tr");


                // ==================================
                // STATUS
                // ==================================

                let statusClass =
                    "bg-secondary";

                if (
                    application.status ===
                    "PENDING"
                ) {

                    statusClass =
                        "bg-warning text-dark";

                } else if (
                    application.status ===
                    "APPROVED"
                ) {

                    statusClass =
                        "bg-success";

                } else if (
                    application.status ===
                    "REJECTED"
                ) {

                    statusClass =
                        "bg-danger";

                }


                // ==================================
                // ACTIONS
                // ==================================

                let actionButtons = "";


                if (
                    application.status ===
                    "PENDING"
                ) {

                    actionButtons = `

                        <button
                            class="btn btn-sm btn-success me-1"
                            onclick="approveApplication(${application.id})">

                            <i class="bi bi-check-lg"></i>

                        </button>


                        <button
                            class="btn btn-sm btn-danger"
                            onclick="rejectApplication(${application.id})">

                            <i class="bi bi-x-lg"></i>

                        </button>

                    `;

                } else {

                    actionButtons = `

                        <span class="text-muted">
                            Reviewed
                        </span>

                    `;

                }


                // ==================================
                // ROW
                // ==================================

                row.innerHTML = `

                    <td>
                        ${application.id}
                    </td>


                    <td>

                        <strong>
                            ${application.organizationName}
                        </strong>

                    </td>


                    <td>
                        ${application.organizationType}
                    </td>


                    <td>

                        <strong>
                            ${application.applicantName}
                        </strong>

                        <small
                            class="d-block text-muted">

                            ${application.applicantEmail}

                        </small>

                    </td>


                    <td>
                        ${application.applicantPosition}
                    </td>


                    <td>
                        ${application.contactNumber}
                    </td>


                    <td>

                        <span
                            class="badge ${statusClass}">

                            ${application.status}

                        </span>

                    </td>


                    <td>

                        ${formatDate(
                            application.appliedAt
                        )}

                    </td>


                    <td>

                        ${actionButtons}

                    </td>

                `;


                applicationTableBody.appendChild(
                    row
                );

            }
        );

    }


    tableContainer.classList.remove(
        "d-none"
    );

}


// ==========================================
// APPROVE APPLICATION
// ==========================================

async function approveApplication(id) {

    const confirmed =
        confirm(
            "Are you sure you want to approve this organization application?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/organization-applications/${id}/approve`,
            {
                method: "PUT"
            }
        );


        alert(
            "Organization application approved successfully!"
        );


        await loadApplications();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to approve application."
        );

    }

}


// ==========================================
// REJECT APPLICATION
// ==========================================

async function rejectApplication(id) {

    const confirmed =
        confirm(
            "Are you sure you want to reject this organization application?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/organization-applications/${id}/reject`,
            {
                method: "PUT"
            }
        );


        alert(
            "Organization application rejected."
        );


        await loadApplications();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to reject application."
        );

    }

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ==========================================
// STATUS FILTER
// ==========================================

statusFilter.addEventListener(
    "change",
    loadApplications
);


// ==========================================
// REFRESH
// ==========================================

document
    .getElementById("refreshButton")
    .addEventListener(
        "click",
        loadApplications
    );


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function () {

            logout();

        }
    );


// ==========================================
// MOBILE SIDEBAR
// ==========================================

document
    .getElementById("sidebarToggle")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("sidebar")
                .classList.toggle(
                    "show"
                );

        }
    );


// ==========================================
// INITIALIZE
// ==========================================

async function initializePage() {

    loadUserInformation();

    await loadApplications();

}

initializePage();