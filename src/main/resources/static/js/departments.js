const token = localStorage.getItem("token");


// ==========================================
// USER ROLE
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

let isOrganizationOwner = false;
let canManageDepartments = isAdmin;
// ==========================================
// AUTH CHECK
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

const loadingMessage =
    document.getElementById("loadingMessage");

const tableContainer =
    document.getElementById("tableContainer");

const departmentTableBody =
    document.getElementById("departmentTableBody");

const errorMessage =
    document.getElementById("errorMessage");


// ==========================================
// USER INFORMATION
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
            payload.sub || "User";

        userRole.textContent =
            payload.role || "Authenticated";

    } catch (error) {

        userEmail.textContent = "User";

        userRole.textContent =
            "Authenticated";

    }

}


// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(url, {

            ...options,

            headers: {

                "Content-Type":
                    "application/json",

                "Authorization":
                    `Bearer ${token}`,

                ...(options.headers || {})

            }

        });


    // Unauthorized / Forbidden

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        localStorage.removeItem("token");

        localStorage.removeItem(
            "tokenType"
        );

        window.location.href =
            "login.html";

        return null;

    }


    // No content

    if (response.status === 204) {

        return null;

    }


    const text =
        await response.text();


    // Empty response

    if (!text) {

        if (!response.ok) {

            throw new Error(
                `Request failed with status ${response.status}`
            );

        }

        return null;

    }


    let data;

    try {

        data =
            JSON.parse(text);

    } catch (error) {

        if (!response.ok) {

            throw new Error(
                `Request failed with status ${response.status}`
            );

        }

        return text;

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed"
        );

    }


    return data;

}

// ==========================================
// CHECK ORGANIZATION OWNER
// ==========================================

async function checkOrganizationOwner() {

    // ADMIN can always manage
    if (isAdmin) {
        isOrganizationOwner = true;
        canManageDepartments = true;
        return;
    }

    try {

        const data =
            await apiRequest("/api/organizations/my");

        if (!data) {
            return;
        }

        isOrganizationOwner =
            data.isOwner === true;

        canManageDepartments =
            isAdmin || isOrganizationOwner;

    } catch (error) {

        console.error(
            "Unable to check organization ownership:",
            error
        );

        isOrganizationOwner = false;
        canManageDepartments = false;
    }
}
// ==========================================
// ADD DEPARTMENT
// ==========================================

const addDepartmentModal =
    new bootstrap.Modal(
        document.getElementById(
            "addDepartmentModal"
        )
    );
    const addDepartmentButton =
    document.getElementById(
        "addDepartmentButton"
    );

if (addDepartmentButton) {

    addDepartmentButton.style.display =
        canManageDepartments
            ? ""
            : "none";
}


document
    .getElementById("addDepartmentButton")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "addDepartmentForm"
                )
                .reset();

            document
                .getElementById(
                    "addDepartmentError"
                )
                .classList.add(
                    "d-none"
                );

            addDepartmentModal.show();

        }
    );


// ==========================================
// CREATE DEPARTMENT
// ==========================================

document
    .getElementById("addDepartmentForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const saveButton =
                document.getElementById(
                    "saveDepartmentButton"
                );

            const errorBox =
                document.getElementById(
                    "addDepartmentError"
                );


            errorBox.classList.add(
                "d-none"
            );


            saveButton.disabled = true;

            saveButton.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-1">
                </span>
                Saving...
            `;


            const departmentData = {

                departmentCode:
                    document
                        .getElementById(
                            "departmentCode"
                        )
                        .value
                        .trim(),

                departmentName:
                    document
                        .getElementById(
                            "departmentName"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "departmentDescription"
                        )
                        .value
                        .trim()

            };


            try {

                await apiRequest(
                    "/api/departments",
                    {
                        method: "POST",
                        body: JSON.stringify(
                            departmentData
                        )
                    }
                );


                addDepartmentModal.hide();


                alert(
                    "Department created successfully!"
                );


                await loadDepartments();


            } catch (error) {

                console.error(error);


                errorBox.textContent =
                    error.message ||
                    "Unable to create department.";


                errorBox.classList.remove(
                    "d-none"
                );


            } finally {

                saveButton.disabled = false;


                saveButton.innerHTML = `
                    <i class="bi bi-check-lg"></i>
                    Save Department
                `;

            }

        }
    );
    // ==========================================
// EDIT DEPARTMENT
// ==========================================

let editingDepartmentId = null;

const editDepartmentModal =
    new bootstrap.Modal(
        document.getElementById(
            "editDepartmentModal"
        )
    );


// ==========================================
// OPEN EDIT MODAL
// ==========================================

async function editDepartment(id) {

    editingDepartmentId = id;

    const errorBox =
        document.getElementById(
            "editDepartmentError"
        );

    errorBox.classList.add("d-none");

    try {

        const department =
            await apiRequest(
                `/api/departments/${id}`
            );

        if (!department) {
            return;
        }


        document
            .getElementById(
                "editDepartmentCode"
            )
            .value =
                department.departmentCode;


        document
            .getElementById(
                "editDepartmentName"
            )
            .value =
                department.departmentName;


        document
            .getElementById(
                "editDepartmentDescription"
            )
            .value =
                department.description || "";


        editDepartmentModal.show();

    } catch (error) {

        console.error(error);

        errorBox.textContent =
            error.message ||
            "Unable to load department.";

        errorBox.classList.remove(
            "d-none"
        );

    }

}
// ==========================================
// UPDATE DEPARTMENT
// ==========================================

document
    .getElementById("editDepartmentForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!editingDepartmentId) {
                return;
            }


            const errorBox =
                document.getElementById(
                    "editDepartmentError"
                );

            const updateButton =
                document.getElementById(
                    "updateDepartmentButton"
                );


            updateButton.disabled = true;

            updateButton.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-1">
                </span>
                Updating...
            `;


            const departmentData = {

                departmentCode:
                    document
                        .getElementById(
                            "editDepartmentCode"
                        )
                        .value
                        .trim(),

                departmentName:
                    document
                        .getElementById(
                            "editDepartmentName"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "editDepartmentDescription"
                        )
                        .value
                        .trim()

            };


            try {

                await apiRequest(
                    `/api/departments/${editingDepartmentId}`,
                    {
                        method: "PUT",
                        body:
                            JSON.stringify(
                                departmentData
                            )
                    }
                );


                editDepartmentModal.hide();


                alert(
                    "Department updated successfully!"
                );


                await loadDepartments();


            } catch (error) {

                console.error(error);

                errorBox.textContent =
                    error.message ||
                    "Unable to update department.";

                errorBox.classList.remove(
                    "d-none"
                );


            } finally {

                updateButton.disabled = false;

                updateButton.innerHTML = `
                    <i class="bi bi-check-lg"></i>
                    Update Department
                `;

            }

        }
    );
    // ==========================================
// DELETE DEPARTMENT
// ==========================================

async function deleteDepartment(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this department?"
        );

    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/api/departments/${id}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Department deleted successfully!"
        );


        await loadDepartments();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to delete department."
        );

    }

}

// ==========================================
// LOAD DEPARTMENTS
// ==========================================

async function loadDepartments() {

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


        const data =
            await apiRequest(
                "/api/departments"
            );


        if (!data) {

            return;

        }


        const departments =
            Array.isArray(data)
                ? data
                : data.content || [];


        renderDepartments(
            departments
        );


    } catch (error) {

        console.error(error);


        errorMessage.textContent =
            error.message ||
            "Unable to load departments.";


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
// RENDER DEPARTMENTS
// ==========================================

function renderDepartments(departments) {

    departmentTableBody.innerHTML = "";


    if (departments.length === 0) {

        departmentTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted py-5">

                    <i class="bi bi-building fs-2"></i>

                    <p class="mt-2 mb-0">
                        No departments found
                    </p>

                </td>

            </tr>

        `;

    } else {

        departments.forEach(department => {

            const row =
                document.createElement("tr");


            // ==================================
            // ROLE-BASED ACTION BUTTONS
            // ==================================

            const actionButtons = canManageDepartments
                ? `
                    <button
                        class="btn btn-outline-primary action-btn me-1"
                        title="Edit"
                        onclick="editDepartment(${department.id})">

                        <i class="bi bi-pencil"></i>

                    </button>

                    <button
                        class="btn btn-outline-danger action-btn"
                        title="Delete"
                        onclick="deleteDepartment(${department.id})">

                        <i class="bi bi-trash"></i>

                    </button>
                  `
                : `
                    <span class="text-muted">
                        View only
                    </span>
                  `;


            row.innerHTML = `

                <td>
                    ${department.id}
                </td>


                <td>

                    <strong>
                        ${department.departmentCode}
                    </strong>

                </td>


                <td>

                    <strong>
                        ${department.departmentName}
                    </strong>

                </td>


                <td>

                    <span class="text-muted">

                        ${
                            department.description ||
                            "No description"
                        }

                    </span>

                </td>


                <td>

                    ${actionButtons}

                </td>

            `;


            departmentTableBody.appendChild(row);

        });

    }


    tableContainer.classList.remove(
        "d-none"
    );

}

// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutButton")
    .addEventListener(
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

    // Check organization ownership first
    await checkOrganizationOwner();

    // Update Add Department button
    const addDepartmentButton =
        document.getElementById(
            "addDepartmentButton"
        );

    if (addDepartmentButton) {

        addDepartmentButton.style.display =
            canManageDepartments
                ? ""
                : "none";
    }

    // Load departments after permission check
    await loadDepartments();
}

initializePage();
