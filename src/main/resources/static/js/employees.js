const token = localStorage.getItem("token");
const currentUserRole = getUserRole();
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

const isAdmin =
    currentUserRole === "ADMIN" ||
    currentUserRole === "ROLE_ADMIN";

let isOrganizationOwner = false;

let canManageEmployees = isAdmin;
const userEmail =
    document.getElementById("userEmail");

const userRole =
    document.getElementById("userRole");

const loadingMessage =
    document.getElementById("loadingMessage");

const tableContainer =
    document.getElementById("tableContainer");

const employeeTableBody =
    document.getElementById("employeeTableBody");

const errorMessage =
    document.getElementById("errorMessage");

const searchInput =
    document.getElementById("searchInput");


// ==========================================
// AUTH CHECK
// ==========================================

if (!token) {

    window.location.href = "login.html";

}


// ==========================================
// LOAD USER
// ==========================================

function loadUserInformation() {

    try {

        const payload =
            JSON.parse(
                atob(
                    token.split(".")[1]
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
        userRole.textContent = "Authenticated";

    }

}
// ==========================================
// CHECK ORGANIZATION OWNER
// ==========================================

async function checkOrganizationOwner() {

    // ADMIN can always manage employees
    if (isAdmin) {
        isOrganizationOwner = true;
        canManageEmployees = true;
        return;
    }

    try {

        const data =
            await apiRequest("/api/organizations/my");

        if (!data) return;

        isOrganizationOwner =
            data.isOwner === true;

        canManageEmployees =
            isAdmin || isOrganizationOwner;

    } catch (error) {

        console.error(
            "Unable to check organization ownership:",
            error
        );

        isOrganizationOwner = false;
        canManageEmployees = false;
    }
}
async function apiRequest(url, options = {}) {

    const response = await fetch(url, {

        ...options,

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }

    });

    // Authentication / authorization failure
    if (response.status === 401 ||
        response.status === 403) {

        localStorage.removeItem("token");
        localStorage.removeItem("tokenType");

        window.location.href = "login.html";

        return null;
    }

    // DELETE may return 204 No Content
    if (response.status === 204) {
        return null;
    }

    // Read response as text first
    const text = await response.text();

    // Empty response body
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
        data = JSON.parse(text);
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
            data.message || "Request failed"
        );

    }

    return data;
}


// ==========================================
// LOAD EMPLOYEES
// ==========================================

async function loadEmployees() {

    try {

        loadingMessage.classList.remove("d-none");
        tableContainer.classList.add("d-none");
        errorMessage.classList.add("d-none");

        const data =
            await apiRequest("/api/employees");

        if (!data) return;

        const employees =
            Array.isArray(data)
                ? data
                : data.content || [];

        renderEmployees(employees);

    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            error.message ||
            "Unable to load employees.";

        errorMessage.classList.remove("d-none");

    } finally {

        loadingMessage.classList.add("d-none");

    }

}


// ==========================================
// RENDER EMPLOYEES
// ==========================================

function renderEmployees(employees) {

    employeeTableBody.innerHTML = "";

    if (employees.length === 0) {

        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-muted py-5">

                    <i class="bi bi-people fs-2"></i>

                    <p class="mt-2 mb-0">
                        No employees found
                    </p>

                </td>
            </tr>
        `;

    } else {

        employees.forEach(employee => {

            const row =
                document.createElement("tr");


            // Status badge

            const statusClass =
                employee.status === "ACTIVE"
                    ? "bg-success"
                    : "bg-secondary";


            // Role-based action buttons

            const actionButtons = canManageEmployees
    ? `
        <button
            class="btn btn-outline-primary action-btn me-1"
            title="Edit"
            onclick="editEmployee(${employee.id})">

            <i class="bi bi-pencil"></i>

        </button>

        <button
            class="btn btn-outline-danger action-btn"
            title="Delete"
            onclick="deleteEmployee(${employee.id})">

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

                    <div class="employee-name">

                        ${employee.firstName}
                        ${employee.lastName}

                    </div>

                    <div class="employee-email">

                        ${employee.email}

                    </div>

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
                    ₹${Number(employee.salary)
                        .toLocaleString("en-IN")}
                </td>


                <td>

                    <span
                        class="badge ${statusClass}">

                        ${employee.status}

                    </span>

                </td>


                <td>

                    ${actionButtons}

                </td>

            `;


            employeeTableBody.appendChild(row);

        });

    }


    tableContainer.classList.remove(
        "d-none"
    );

}


// ==========================================
// SEARCH
// ==========================================

let searchTimer;

searchInput.addEventListener("input", function () {

    clearTimeout(searchTimer);

    const firstName =
        searchInput.value.trim();

    searchTimer =
        setTimeout(async () => {

            if (!firstName) {

                await loadEmployees();

                return;

            }

            try {

                const data =
                    await apiRequest(
                        `/api/employees/search?name=${encodeURIComponent(firstName)}`
                     );

                if (!data) return;

                const employees =
                    Array.isArray(data)
                        ? data
                        : data.content || [];

                renderEmployees(employees);

            } catch (error) {

                errorMessage.textContent =
                    error.message;

                errorMessage.classList.remove(
                    "d-none"
                );

            }

        }, 300);

});


// ==========================================
// ADD EMPLOYEE MODAL
// ==========================================

const addEmployeeModal =
    new bootstrap.Modal(
        document.getElementById("addEmployeeModal")
    );

document
    .getElementById("addEmployeeButton")
    .addEventListener("click", async function () {

        document
            .getElementById("addEmployeeForm")
            .reset();

        document
            .getElementById("addEmployeeError")
            .classList.add("d-none");

        await loadDepartmentsForForm();

        addEmployeeModal.show();

    });
    
    // ==========================================
// LOAD DEPARTMENTS FOR ADD EMPLOYEE FORM
// ==========================================

async function loadDepartmentsForForm() {

    const departmentSelect =
        document.getElementById("departmentId");

    try {

        departmentSelect.innerHTML = `
            <option value="">
                Loading departments...
            </option>
        `;

        const data =
            await apiRequest("/api/departments");

        if (!data) return;

        const departments =
            Array.isArray(data)
                ? data
                : data.content || [];

        departmentSelect.innerHTML = `
            <option value="">
                Select Department
            </option>
        `;

        departments.forEach(department => {

            const option =
                document.createElement("option");

            option.value = department.id;

            option.textContent =
                department.departmentName;

            departmentSelect.appendChild(option);

        });

    } catch (error) {

        departmentSelect.innerHTML = `
            <option value="">
                Unable to load departments
            </option>
        `;

        console.error(error);

    }

}
// ==========================================
// CREATE EMPLOYEE
// ==========================================

document
    .getElementById("addEmployeeForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const saveButton =
            document.getElementById("saveEmployeeButton");

        const errorBox =
            document.getElementById("addEmployeeError");

        errorBox.classList.add("d-none");

        saveButton.disabled = true;

        saveButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-1">
            </span>
            Saving...
        `;

        const departmentId =
    document.getElementById("departmentId").value;

if (!departmentId) {

    errorBox.textContent =
        "Please select a department.";

    errorBox.classList.remove("d-none");

    saveButton.disabled = false;

    saveButton.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Save Employee
    `;

    return;
}

const employeeData = {

    employeeCode:
        document.getElementById("employeeCode").value.trim(),

    firstName:
        document.getElementById("firstName").value.trim(),

    lastName:
        document.getElementById("lastName").value.trim(),

    email:
        document.getElementById("employeeEmail").value.trim(),

    phone:
        document.getElementById("phone").value.trim(),

    gender:
        document.getElementById("gender").value,

    designation:
        document.getElementById("designation").value,

    salary:
        Number(document.getElementById("salary").value),

    joiningDate:
        document.getElementById("joiningDate").value,

    status:
        document.getElementById("status").value,

    departmentId:
        Number(departmentId)
};

        try {

            await apiRequest(
                "/api/employees",
                {
                    method: "POST",
                    body: JSON.stringify(employeeData)
                }
            );

            addEmployeeModal.hide();

            alert(
                "Employee created successfully!"
            );

            await loadEmployees();

        } catch (error) {

            console.error(error);

            errorBox.textContent =
                error.message ||
                "Unable to create employee.";

            errorBox.classList.remove("d-none");

        } finally {

            saveButton.disabled = false;

            saveButton.innerHTML = `
                <i class="bi bi-check-lg"></i>
                Save Employee
            `;

        }

    });
// ==========================================
// EDIT EMPLOYEE MODAL
// ==========================================

let editingEmployeeId = null;

const editEmployeeModal =
    new bootstrap.Modal(
        document.getElementById("editEmployeeModal")
    );


// ==========================================
// OPEN EDIT MODAL
// ==========================================

async function editEmployee(id) {

    editingEmployeeId = id;

    const errorBox =
        document.getElementById("editEmployeeError");

    errorBox.classList.add("d-none");

    try {

        // Show loading state

        document
            .getElementById("editEmployeeCode")
            .value = "Loading...";


        // Get employee by ID

        const employee =
            await apiRequest(
                `/api/employees/${id}`
            );

        if (!employee) return;


        // Load departments

        await loadDepartmentsForEdit(
            employee.departmentName
        );


        // Fill form

        document
            .getElementById("editEmployeeCode")
            .value = employee.employeeCode;

        document
            .getElementById("editFirstName")
            .value = employee.firstName;

        document
            .getElementById("editLastName")
            .value = employee.lastName;

        document
            .getElementById("editEmployeeEmail")
            .value = employee.email;

        document
            .getElementById("editPhone")
            .value = employee.phone;

        document
            .getElementById("editGender")
            .value = employee.gender;

        document
            .getElementById("editDesignation")
            .value = employee.designation;

        document
            .getElementById("editSalary")
            .value = employee.salary;

        document
            .getElementById("editJoiningDate")
            .value = employee.joiningDate;

        document
            .getElementById("editStatus")
            .value = employee.status;


        editEmployeeModal.show();

    } catch (error) {

        console.error(error);

        errorBox.textContent =
            error.message ||
            "Unable to load employee.";

        errorBox.classList.remove("d-none");

    }

}
// ==========================================
// LOAD DEPARTMENTS FOR EDIT
// ==========================================

async function loadDepartmentsForEdit(
    currentDepartmentName
) {

    const departmentSelect =
        document.getElementById("editDepartmentId");

    departmentSelect.innerHTML = `
        <option value="">
            Loading departments...
        </option>
    `;

    const data =
        await apiRequest("/api/departments");

    if (!data) return;

    const departments =
        Array.isArray(data)
            ? data
            : data.content || [];

    departmentSelect.innerHTML = `
        <option value="">
            Select Department
        </option>
    `;

    departments.forEach(department => {

        const option =
            document.createElement("option");

        option.value = department.id;

        option.textContent =
            department.departmentName;

        if (
            department.departmentName ===
            currentDepartmentName
        ) {
            option.selected = true;
        }

        departmentSelect.appendChild(option);

    });

}
// ==========================================
// UPDATE EMPLOYEE
// ==========================================

document
    .getElementById("editEmployeeForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!editingEmployeeId) {
            return;
        }

        const errorBox =
            document.getElementById(
                "editEmployeeError"
            );

        const updateButton =
            document.getElementById(
                "updateEmployeeButton"
            );

        const departmentId =
            document.getElementById(
                "editDepartmentId"
            ).value;


        // Validate department

        if (!departmentId) {

            errorBox.textContent =
                "Please select a department.";

            errorBox.classList.remove(
                "d-none"
            );

            return;
        }


        updateButton.disabled = true;

        updateButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-1">
            </span>
            Updating...
        `;


        const employeeData = {

            employeeCode:
                document
                    .getElementById(
                        "editEmployeeCode"
                    )
                    .value
                    .trim(),

            firstName:
                document
                    .getElementById(
                        "editFirstName"
                    )
                    .value
                    .trim(),

            lastName:
                document
                    .getElementById(
                        "editLastName"
                    )
                    .value
                    .trim(),

            email:
                document
                    .getElementById(
                        "editEmployeeEmail"
                    )
                    .value
                    .trim(),

            phone:
                document
                    .getElementById(
                        "editPhone"
                    )
                    .value
                    .trim(),

            gender:
                document
                    .getElementById(
                        "editGender"
                    )
                    .value,

            designation:
                document
                    .getElementById(
                        "editDesignation"
                    )
                    .value,

            salary:
                Number(
                    document
                        .getElementById(
                            "editSalary"
                        )
                        .value
                ),

            joiningDate:
                document
                    .getElementById(
                        "editJoiningDate"
                    )
                    .value,

            status:
                document
                    .getElementById(
                        "editStatus"
                    )
                    .value,

            departmentId:
                Number(departmentId)

        };


        try {

            await apiRequest(
                `/api/employees/${editingEmployeeId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        employeeData
                    )
                }
            );


            editEmployeeModal.hide();

            alert(
                "Employee updated successfully!"
            );


            await loadEmployees();


        } catch (error) {

            console.error(error);

            errorBox.textContent =
                error.message ||
                "Unable to update employee.";

            errorBox.classList.remove(
                "d-none"
            );

        } finally {

            updateButton.disabled = false;

            updateButton.innerHTML = `
                <i class="bi bi-check-lg"></i>
                Update Employee
            `;

        }

    });


// ==========================================
// DELETE EMPLOYEE
// ==========================================

async function deleteEmployee(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this employee?"
        );

    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/api/employees/${id}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Employee deleted successfully!"
        );


        await loadEmployees();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to delete employee."
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutButton")
    .addEventListener("click", function () {

        localStorage.removeItem("token");
        localStorage.removeItem("tokenType");

        window.location.href =
            "login.html";

    });


// ==========================================
// MOBILE SIDEBAR
// ==========================================

document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {

        document
            .getElementById("sidebar")
            .classList.toggle("show");

    });


// ==========================================
// INITIALIZE
// ==========================================

async function initializePage() {

    loadUserInformation();

    await checkOrganizationOwner();

    // Update Add Employee button
    const addEmployeeButton =
        document.getElementById(
            "addEmployeeButton"
        );

    if (addEmployeeButton) {

        addEmployeeButton.style.display =
            canManageEmployees
                ? ""
                : "none";
    }

    await loadEmployees();
}

initializePage();