const token = localStorage.getItem("token");
const applyOrganizationLink =
    document.getElementById(
        "applyOrganizationLink"
    );

const applicationsLink =
    document.getElementById(
        "applicationsLink"
    );
const userEmail =
    document.getElementById("userEmail");

const userRole =
    document.getElementById("userRole");

const totalEmployees =
    document.getElementById("totalEmployees");

const totalDepartments =
    document.getElementById("totalDepartments");

const activeEmployees =
    document.getElementById("activeEmployees");

const inactiveEmployees =
    document.getElementById("inactiveEmployees");

const loadingMessage =
    document.getElementById("loadingMessage");

const dashboardError =
    document.getElementById("dashboardError");

const employeeTableContainer =
    document.getElementById("employeeTableContainer");

const employeeTableBody =
    document.getElementById("employeeTableBody");


// ==========================================
// AUTHENTICATION CHECK
// ==========================================

if (!token) {

    window.location.href = "login.html";

}


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
            payload.sub || "User";

        userRole.textContent =
            payload.role || "Authenticated User";
            // ==========================================
// ROLE-BASED SIDEBAR
// ==========================================

const role = payload.role;


if (role === "ROLE_ADMIN" || role === "ADMIN") {

    // ADMIN
    applyOrganizationLink.classList.add(
        "d-none"
    );

    applicationsLink.classList.remove(
        "d-none"
    );

} else {

    // EMPLOYEE
    applyOrganizationLink.classList.remove(
        "d-none"
    );

    applicationsLink.classList.add(
        "d-none"
    );

}

    } catch (error) {

        userEmail.textContent = "User";

        userRole.textContent =
            "Authenticated";

    }

}


// ==========================================
// AUTHORIZED API REQUEST
// ==========================================

async function apiRequest(url) {

    const response =
        await fetch(url, {

            headers: {

                "Authorization":
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"

            }

        });


    // Unauthorized / Forbidden

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


    if (!response.ok) {

        throw new Error(
            `Request failed with status ${response.status}`
        );

    }


    return await response.json();

}


// ==========================================
// LOAD EMPLOYEES
// ==========================================

async function loadEmployees() {

    const data =
        await apiRequest(
            "/api/employees"
        );


    if (!data) {
        return;
    }


    /*
     * API may return:
     *
     * 1. List<EmployeeResponse>
     *
     * 2. Page<EmployeeResponse>
     */

    const employees =
        Array.isArray(data)
            ? data
            : data.content || [];


    // ======================================
    // TOTAL EMPLOYEES
    // ======================================

    const totalEmployeeCount =
        Array.isArray(data)
            ? employees.length
            : data.totalElements;


    totalEmployees.textContent =
        totalEmployeeCount;


    // ======================================
    // ACTIVE / INACTIVE EMPLOYEES
    // ======================================

    const active =
        employees.filter(
            employee =>
                employee.status === "ACTIVE"
        );


    const inactive =
        employees.filter(
            employee =>
                employee.status !== "ACTIVE"
        );


    /*
     * IMPORTANT:
     *
     * If the API is paginated, these active/
     * inactive values represent the employees
     * returned in the current page.
     *
     * If your /api/employees endpoint returns
     * all employees, these are exact totals.
     */

    activeEmployees.textContent =
        active.length;

    inactiveEmployees.textContent =
        inactive.length;


    // ======================================
    // RECENT EMPLOYEES
    // ======================================

    renderEmployees(employees);

}


// ==========================================
// RENDER EMPLOYEE TABLE
// ==========================================

function renderEmployees(employees) {

    employeeTableBody.innerHTML = "";


    if (employees.length === 0) {

        employeeTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted py-4">

                    No employees found.

                </td>

            </tr>

        `;

    } else {

        /*
         * Show maximum 5 employees
         * on dashboard.
         */

        employees
            .slice(0, 5)
            .forEach(employee => {

                const row =
                    document.createElement("tr");


                const statusClass =
                    employee.status === "ACTIVE"
                        ? "bg-success"
                        : "bg-secondary";


                row.innerHTML = `

                    <td>

                        <strong>
                            ${employee.firstName}
                            ${employee.lastName}
                        </strong>

                        <small
                            class="d-block text-muted">

                            ${employee.email}

                        </small>

                    </td>


                    <td>
                        ${employee.employeeCode}
                    </td>


                    <td>
                        ${employee.designation}
                    </td>


                    <td>
                        ${employee.departmentName}
                    </td>


                    <td>

                        <span
                            class="badge ${statusClass}">

                            ${employee.status}

                        </span>

                    </td>

                `;


                employeeTableBody.appendChild(row);

            });

    }


    loadingMessage.classList.add(
        "d-none"
    );

    employeeTableContainer.classList.remove(
        "d-none"
    );

}


// ==========================================
// LOAD DEPARTMENTS
// ==========================================

async function loadDepartments() {

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


    const totalDepartmentCount =
        Array.isArray(data)
            ? departments.length
            : data.totalElements;


    totalDepartments.textContent =
        totalDepartmentCount;

}


// ==========================================
// ERROR HANDLING
// ==========================================

async function loadDashboard() {

    try {

        await Promise.all([

            loadEmployees(),

            loadDepartments()

        ]);

    } catch (error) {

        console.error(error);


        loadingMessage.classList.add(
            "d-none"
        );


        dashboardError.textContent =
            error.message ||
            "Unable to load dashboard data.";


        dashboardError.classList.remove(
            "d-none"
        );

    }

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

loadUserInformation();

loadDashboard();