const token =
    localStorage.getItem("token");


// ==========================================
// AUTH CHECK
// ==========================================

if (!token) {

    window.location.href =
        "login.html";
}


// ==========================================
// DOM ELEMENTS
// ==========================================

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");

const profileFirstName =
    document.getElementById("profileFirstName");

const profileLastName =
    document.getElementById("profileLastName");

const profileEmailValue =
    document.getElementById("profileEmailValue");

const profileRoleValue =
    document.getElementById("profileRoleValue");

const profileOrganizationName =
    document.getElementById("profileOrganizationName");

const profileOrganizationType =
    document.getElementById("profileOrganizationType");

const profileOrganizationId =
    document.getElementById("profileOrganizationId");

const logoutButton =
    document.getElementById("logoutButton");

const sidebarToggle =
    document.getElementById("sidebarToggle");

const sidebar =
    document.getElementById("sidebar");


// ==========================================
// CHANGE PASSWORD ELEMENTS
// ==========================================

const changePasswordForm =
    document.getElementById("changePasswordForm");

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const changePasswordButton =
    document.getElementById("changePasswordButton");

const passwordMessage =
    document.getElementById("passwordMessage");


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


    // ======================================
    // AUTH ERROR
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


    // ======================================
    // READ RESPONSE
    // ======================================

    const text =
        await response.text();


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

        throw new Error(
            "Invalid server response."
        );
    }


    // ======================================
    // API ERROR
    // ======================================

    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            "Request failed."
        );
    }


    return data;
}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    try {

        const profile =
            await apiRequest(
                "/api/profile/me"
            );


        if (!profile) {
            return;
        }


        // ==================================
        // FULL NAME
        // ==================================

        const firstName =
            profile.firstName || "";

        const lastName =
            profile.lastName || "";


        const fullName =
            `${firstName} ${lastName}`.trim();


        profileName.textContent =
            fullName || "User";


        // ==================================
        // EMAIL
        // ==================================

        profileEmail.textContent =
            profile.email || "-";

        profileEmailValue.textContent =
            profile.email || "-";


        // ==================================
        // ROLE
        // ==================================

        const role =
            profile.role || "USER";


        profileRole.textContent =
            `ROLE_${role}`;

        profileRoleValue.textContent =
            `ROLE_${role}`;


        // ==================================
        // FIRST NAME
        // ==================================

        profileFirstName.textContent =
            firstName || "-";


        // ==================================
        // LAST NAME
        // ==================================

        profileLastName.textContent =
            lastName || "-";


        // ==================================
        // ORGANIZATION
        // ==================================

        profileOrganizationName.textContent =
            profile.organizationName ||
            "Not Assigned";

        profileOrganizationType.textContent =
            profile.organizationType ||
            "Not Assigned";

        profileOrganizationId.textContent =
            profile.organizationId ||
            "Not Assigned";

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        profileName.textContent =
            "Unable to load profile";

        profileEmail.textContent =
            error.message ||
            "Unable to load profile.";
    }
}


// ==========================================
// CHANGE PASSWORD
// ==========================================

if (changePasswordForm) {

    changePasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==================================
            // CLEAR MESSAGE
            // ==================================

            passwordMessage.textContent = "";

            passwordMessage.classList.add(
                "d-none"
            );


            // ==================================
            // GET VALUES
            // ==================================

            const current =
                currentPassword.value.trim();

            const newPass =
                newPassword.value.trim();

            const confirm =
                confirmPassword.value.trim();


            // ==================================
            // FRONTEND VALIDATION
            // ==================================

            if (!current) {

                showPasswordMessage(
                    "Current password is required.",
                    "error"
                );

                return;
            }


            if (!newPass) {

                showPasswordMessage(
                    "New password is required.",
                    "error"
                );

                return;
            }


            if (newPass.length < 6) {

                showPasswordMessage(
                    "New password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            if (!confirm) {

                showPasswordMessage(
                    "Confirm password is required.",
                    "error"
                );

                return;
            }


            if (newPass !== confirm) {

                showPasswordMessage(
                    "New passwords do not match.",
                    "error"
                );

                return;
            }


            // ==================================
            // DISABLE BUTTON
            // ==================================

            changePasswordButton.disabled =
                true;

            changePasswordButton.innerHTML = `
                <span
                    class="spinner-border spinner-border-sm me-1">
                </span>
                Changing...
            `;


            try {

                // ==================================
                // CHANGE PASSWORD API
                // ==================================

                const response =
                    await apiRequest(
                        "/api/profile/change-password",
                        {

                            // IMPORTANT:
                            // Backend expects POST
                            method: "PUT",

                            body: JSON.stringify({

                                currentPassword:
                                    current,

                                newPassword:
                                    newPass,

                                confirmPassword:
                                    confirm
                            })
                        }
                    );


                // ==================================
                // SUCCESS
                // ==================================

                showPasswordMessage(
                    response?.message ||
                    "Password changed successfully.",
                    "success"
                );


                // Clear password fields

                changePasswordForm.reset();


            } catch (error) {

                console.error(
                    "Change password error:",
                    error
                );


                showPasswordMessage(
                    error.message ||
                    "Unable to change password.",
                    "error"
                );

            } finally {

                // ==================================
                // RESTORE BUTTON
                // ==================================

                changePasswordButton.disabled =
                    false;

                changePasswordButton.innerHTML = `
                    <i class="bi bi-shield-lock me-1"></i>
                    Change Password
                `;
            }

        }
    );
}


// ==========================================
// PASSWORD MESSAGE
// ==========================================

function showPasswordMessage(
    message,
    type
) {

    passwordMessage.textContent =
        message;


    passwordMessage.classList.remove(
        "d-none",
        "text-success",
        "text-danger"
    );


    if (type === "success") {

        passwordMessage.classList.add(
            "text-success"
        );

    } else {

        passwordMessage.classList.add(
            "text-danger"
        );
    }
}


// ==========================================
// LOGOUT
// ==========================================

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

if (sidebarToggle && sidebar) {

    sidebarToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "show"
            );
        }
    );
}


// ==========================================
// INITIALIZE
// ==========================================

loadProfile();