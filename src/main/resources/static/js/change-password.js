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

const changePasswordForm =
    document.getElementById(
        "changePasswordForm"
    );

const currentPassword =
    document.getElementById(
        "currentPassword"
    );

const newPassword =
    document.getElementById(
        "newPassword"
    );

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );

const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );

const passwordMessage =
    document.getElementById(
        "passwordMessage"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    passwordMessage.textContent =
        message;


    passwordMessage.classList.remove(
        "d-none",
        "alert-success",
        "alert-danger"
    );


    if (type === "success") {

        passwordMessage.classList.add(
            "alert-success"
        );

    } else {

        passwordMessage.classList.add(
            "alert-danger"
        );

    }

}


// ==========================================
// CHANGE PASSWORD
// ==========================================

changePasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();
        event.stopPropagation();


        // ======================================
        // CLEAR MESSAGE
        // ======================================

        passwordMessage.classList.add(
            "d-none"
        );


        // ======================================
        // VALUES
        // ======================================

        const current =
            currentPassword.value;

        const newPass =
            newPassword.value;

        const confirm =
            confirmPassword.value;


        // ======================================
        // VALIDATION
        // ======================================

        if (!current) {

            showMessage(
                "Current password is required.",
                "error"
            );

            return;
        }


        if (!newPass) {

            showMessage(
                "New password is required.",
                "error"
            );

            return;
        }


        if (newPass.length < 6) {

            showMessage(
                "New password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        if (!confirm) {

            showMessage(
                "Confirm password is required.",
                "error"
            );

            return;
        }


        if (newPass !== confirm) {

            showMessage(
                "New passwords do not match.",
                "error"
            );

            return;
        }


        // ======================================
        // DISABLE BUTTON
        // ======================================

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
            // API REQUEST
            // ==================================

            const response =
    await fetch(
        "/api/profile/change-password",
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                currentPassword: current,
                newPassword: newPass,
                confirmPassword: confirm
            })
        }
    );


            // ==================================
            // SESSION ERROR
            // ==================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "tokenType"
                );

                window.location.href =
                    "login.html";

                return;

            }


            // ==================================
            // RESPONSE
            // ==================================

            const text =
                await response.text();


            let data = null;


            if (text) {

                try {

                    data =
                        JSON.parse(text);

                } catch (error) {

                    data = null;

                }

            }


            // ==================================
            // ERROR
            // ==================================

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to change password."
                );

            }


            // ==================================
            // SUCCESS
            // ==================================

            showMessage(
                data?.message ||
                "Password changed successfully.",
                "success"
            );


            changePasswordForm.reset();


        } catch (error) {

            console.error(
                "Change password error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to change password.",
                "error"
            );

        } finally {

            changePasswordButton.disabled =
                false;


            changePasswordButton.innerHTML = `
                <i class="bi bi-shield-lock me-1"></i>
                Change Password
            `;

        }

    }
);


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

if (
    sidebarToggle &&
    sidebar
) {

    sidebarToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "show"
            );

        }
    );

}