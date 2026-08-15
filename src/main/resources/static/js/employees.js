// ==========================================
// AUTH & USER ROLE
// ==========================================

const token = localStorage.getItem("token");


// ==========================================
// AUTH CHECK
// ==========================================

if (!token) {

    window.location.href = "login.html";

}


// ==========================================
// GET USER ROLE
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

        console.error("Unable to read user role:", error);

        return "";

    }

}


const currentUserRole = getUserRole();

const isAdmin =
    currentUserRole === "ADMIN" ||
    currentUserRole === "ROLE_ADMIN";


// ==========================================
// ORGANIZATION PERMISSION
// ==========================================

let isOrganizationOwner = false;

let canManageEmployees = isAdmin;


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

const employeeTableBody =
    document.getElementById("employeeTableBody");

const errorMessage =
    document.getElementById("errorMessage");

const searchInput =
    document.getElementById("searchInput");


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
            payload.role || "Authenticated";

    } catch (error) {

        userEmail.textContent = "User";

        userRole.textContent =
            "Authenticated";

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

        /*
         * IMPORTANT:
         * apiRequest() already contains /api
         *
         * So use:
         * /organizations/my
         *
         * NOT:
         * /api/organizations/my
         */

        const data =
            await apiRequest(
                "/organizations/my"
            );


        if (!data) {

            isOrganizationOwner = false;

            canManageEmployees = false;

            return;

        }


        isOrganizationOwner =
            data.isOwner === true;


        canManageEmployees =
            isOrganizationOwner;


    } catch (error) {

        console.error(
            "Unable to check organization ownership:",
            error
        );

        isOrganizationOwner = false;

        canManageEmployees = false;

    }

}


// ==========================================
// LOAD EMPLOYEES
// ==========================================

async function loadEmployees() {

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


        /*
         * IMPORTANT:
         *
         * apiRequest() already adds /api.
         *
         * Therefore:
         *
         * /employees
         *
         * becomes:
         *
         * /api/employees
         */

        const data =
            await apiRequest(
                "/employees"
            );


        if (!data) {

            return;

        }


        const employees =
            Array.isArray(data)
                ? data
                : data.content || [];


        renderEmployees(
            employees
        );


    } catch (error) {

        console.error(
            "Unable to load employees:",
            error
        );


        errorMessage.textContent =
            error.message ||
            "Unable to load employees.";


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
// RENDER EMPLOYEES
// ==========================================

function renderEmployees(employees) {

    employeeTableBody.innerHTML = "";


    if (employees.length === 0) {

        employeeTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted py-5">

                    <i
                        class="bi bi-people fs-2">
                    </i>

                    <p class="mt-2 mb-0">

                        No employees found

                    </p>

                </td>

            </tr>

        `;

    } else {

        employees.forEach(
            employee => {

                const row =
                    document.createElement(
                        "tr"
                    );


                // ==================================
                // STATUS BADGE
                // ==================================

                const statusClass =
                    employee.status === "ACTIVE"
                        ? "bg-success"
                        : "bg-secondary";


                // ==================================
                // ACTION BUTTONS
                // ==================================

                const actionButtons =
                    canManageEmployees

                        ? `

                            <button
                                class="btn btn-outline-primary action-btn me-1"
                                title="Edit"
                                onclick="editEmployee(${employee.id})">

                                <i
                                    class="bi bi-pencil">
                                </i>

                            </button>


                            <button
                                class="btn btn-outline-danger action-btn"
                                title="Delete"
                                onclick="deleteEmployee(${employee.id})">

                                <i
                                    class="bi bi-trash">
                                </i>

                            </button>

                          `

                        : `

                            <span class="text-muted">
                                View only
                            </span>

                          `;


                // ==================================
                // ROW
                // ==================================

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
                        ${employee.departmentName || "-"}
                    </td>


                    <td>

                        ₹${Number(
                            employee.salary || 0
                        ).toLocaleString("en-IN")}

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


                employeeTableBody.appendChild(
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
// SEARCH EMPLOYEES
// ==========================================

let searchTimer;


searchInput.addEventListener(
    "input",
    function () {

        clearTimeout(
            searchTimer
        );


        const firstName =
            searchInput.value.trim();


        searchTimer =
            setTimeout(
                async function () {

                    // --------------------------
                    // EMPTY SEARCH
                    // --------------------------

                    if (!firstName) {

                        await loadEmployees();

                        return;

                    }


                    try {

                        /*
                         * Central apiRequest()
                         * already adds /api
                         */

                        const data =
                            await apiRequest(
                                `/employees/search?name=${encodeURIComponent(firstName)}`
                            );


                        if (!data) {

                            return;

                        }


                        const employees =
                            Array.isArray(data)
                                ? data
                                : data.content || [];


                        renderEmployees(
                            employees
                        );


                    } catch (error) {

                        console.error(error);


                        errorMessage.textContent =
                            error.message ||
                            "Unable to search employees.";


                        errorMessage.classList.remove(
                            "d-none"
                        );

                    }

                },
                300
            );

    }
);


// ==========================================
// ADD EMPLOYEE MODAL
// ==========================================

const addEmployeeModal =
    new bootstrap.Modal(
        document.getElementById(
            "addEmployeeModal"
        )
    );


const addEmployeeButton =
    document.getElementById(
        "addEmployeeButton"
    );


if (addEmployeeButton) {

    addEmployeeButton.addEventListener(
        "click",
        async function () {

            document
                .getElementById(
                    "addEmployeeForm"
                )
                .reset();


            document
                .getElementById(
                    "addEmployeeError"
                )
                .classList.add(
                    "d-none"
                );


            await loadDepartmentsForForm();


            addEmployeeModal.show();

        }
    );

}


// ==========================================
// LOAD DEPARTMENTS FOR ADD EMPLOYEE
// ==========================================

async function loadDepartmentsForForm() {

    const departmentSelect =
        document.getElementById(
            "departmentId"
        );


    try {

        departmentSelect.innerHTML = `

            <option value="">
                Loading departments...
            </option>

        `;


        /*
         * Correct:
         * /departments
         *
         * apiRequest() adds /api
         */

        const data =
            await apiRequest(
                "/departments"
            );


        if (!data) {

            return;

        }


        const departments =
            Array.isArray(data)
                ? data
                : data.content || [];


        departmentSelect.innerHTML = `

            <option value="">
                Select Department
            </option>

        `;


        departments.forEach(
            department => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    department.id;


                option.textContent =
                    department.departmentName;


                departmentSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load departments:",
            error
        );


        departmentSelect.innerHTML = `

            <option value="">
                Unable to load departments
            </option>

        `;

    }

}


// ==========================================
// CREATE EMPLOYEE
// ==========================================

document
    .getElementById(
        "addEmployeeForm"
    )
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const saveButton =
                document.getElementById(
                    "saveEmployeeButton"
                );


            const errorBox =
                document.getElementById(
                    "addEmployeeError"
                );


            errorBox.classList.add(
                "d-none"
            );


            const departmentId =
                document.getElementById(
                    "departmentId"
                ).value;


            if (!departmentId) {

                errorBox.textContent =
                    "Please select a department.";


                errorBox.classList.remove(
                    "d-none"
                );


                return;

            }


            saveButton.disabled = true;


            saveButton.innerHTML = `

                <span
                    class="spinner-border spinner-border-sm me-1">
                </span>

                Saving...

            `;


            const employeeData = {

                employeeCode:
                    document
                        .getElementById(
                            "employeeCode"
                        )
                        .value
                        .trim(),


                firstName:
                    document
                        .getElementById(
                            "firstName"
                        )
                        .value
                        .trim(),


                lastName:
                    document
                        .getElementById(
                            "lastName"
                        )
                        .value
                        .trim(),


                email:
                    document
                        .getElementById(
                            "employeeEmail"
                        )
                        .value
                        .trim(),


                phone:
                    document
                        .getElementById(
                            "phone"
                        )
                        .value
                        .trim(),


                gender:
                    document
                        .getElementById(
                            "gender"
                        )
                        .value,


                designation:
                    document
                        .getElementById(
                            "designation"
                        )
                        .value,


                salary:
                    Number(
                        document
                            .getElementById(
                                "salary"
                            )
                            .value
                    ),


                joiningDate:
                    document
                        .getElementById(
                            "joiningDate"
                        )
                        .value,


                status:
                    document
                        .getElementById(
                            "status"
                        )
                        .value,


                departmentId:
                    Number(
                        departmentId
                    )

            };


            try {

                await apiRequest(
                    "/employees",
                    {
                        method: "POST",

                        body:
                            JSON.stringify(
                                employeeData
                            )
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


                errorBox.classList.remove(
                    "d-none"
                );


            } finally {

                saveButton.disabled = false;


                saveButton.innerHTML = `

                    <i class="bi bi-check-lg"></i>

                    Save Employee

                `;

            }

        }
    );


// ==========================================
// EDIT EMPLOYEE
// ==========================================

let editingEmployeeId = null;


const editEmployeeModal =
    new bootstrap.Modal(
        document.getElementById(
            "editEmployeeModal"
        )
    );


// ==========================================
// OPEN EDIT MODAL
// ==========================================

async function editEmployee(id) {

    editingEmployeeId = id;


    const errorBox =
        document.getElementById(
            "editEmployeeError"
        );


    errorBox.classList.add(
        "d-none"
    );


    try {

        document
            .getElementById(
                "editEmployeeCode"
            )
            .value =
                "Loading...";


        const employee =
            await apiRequest(
                `/employees/${id}`
            );


        if (!employee) {

            return;

        }


        await loadDepartmentsForEdit(
            employee.departmentName
        );


        document
            .getElementById(
                "editEmployeeCode"
            )
            .value =
                employee.employeeCode;


        document
            .getElementById(
                "editFirstName"
            )
            .value =
                employee.firstName;


        document
            .getElementById(
                "editLastName"
            )
            .value =
                employee.lastName;


        document
            .getElementById(
                "editEmployeeEmail"
            )
            .value =
                employee.email;


        document
            .getElementById(
                "editPhone"
            )
            .value =
                employee.phone;


        document
            .getElementById(
                "editGender"
            )
            .value =
                employee.gender;


        document
            .getElementById(
                "editDesignation"
            )
            .value =
                employee.designation;


        document
            .getElementById(
                "editSalary"
            )
            .value =
                employee.salary;


        document
            .getElementById(
                "editJoiningDate"
            )
            .value =
                employee.joiningDate;


        document
            .getElementById(
                "editStatus"
            )
            .value =
                employee.status;


        editEmployeeModal.show();


    } catch (error) {

        console.error(error);


        errorBox.textContent =
            error.message ||
            "Unable to load employee.";


        errorBox.classList.remove(
            "d-none"
        );

    }

}


// ==========================================
// LOAD DEPARTMENTS FOR EDIT
// ==========================================

async function loadDepartmentsForEdit(
    currentDepartmentName
) {

    const departmentSelect =
        document.getElementById(
            "editDepartmentId"
        );


    departmentSelect.innerHTML = `

        <option value="">
            Loading departments...
        </option>

    `;


    try {

        const data =
            await apiRequest(
                "/departments"
            );


        if (!data) {

            return;

        }


        const departments =
            Array.isArray(data)
                ? data
                : data.content || [];


        departmentSelect.innerHTML = `

            <option value="">
                Select Department
            </option>

        `;


        departments.forEach(
            department => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    department.id;


                option.textContent =
                    department.departmentName;


                if (
                    department.departmentName ===
                    currentDepartmentName
                ) {

                    option.selected = true;

                }


                departmentSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load departments:",
            error
        );


        departmentSelect.innerHTML = `

            <option value="">
                Unable to load departments
            </option>

        `;

    }

}


// ==========================================
// UPDATE EMPLOYEE
// ==========================================

document
    .getElementById(
        "editEmployeeForm"
    )
    .addEventListener(
        "submit",
        async function (event) {

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
                    Number(
                        departmentId
                    )

            };


            try {

                await apiRequest(
                    `/employees/${editingEmployeeId}`,
                    {
                        method: "PUT",

                        body:
                            JSON.stringify(
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

        }
    );


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
            `/employees/${id}`,
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
    .getElementById(
        "logoutButton"
    )
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
    .getElementById(
        "sidebarToggle"
    )
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "sidebar"
                )
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


    await checkOrganizationOwner();


    // --------------------------------------
    // ADD EMPLOYEE BUTTON
    // --------------------------------------

    if (addEmployeeButton) {

        addEmployeeButton.style.display =
            canManageEmployees
                ? ""
                : "none";

    }


    // --------------------------------------
    // LOAD EMPLOYEES
    // --------------------------------------

    await loadEmployees();

}


initializePage();