// ==========================================
// REGISTER PAGE
// ==========================================

const registerForm =
    document.getElementById(
        "registerForm"
    );

const registerButton =
    document.getElementById(
        "registerButton"
    );

const registerError =
    document.getElementById(
        "registerError"
    );

const registerSuccess =
    document.getElementById(
        "registerSuccess"
    );


// ==========================================
// PASSWORD TOGGLE
// ==========================================

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const passwordInput =
    document.getElementById(
        "password"
    );


togglePassword.addEventListener(
    "click",
    function () {

        const isPassword =
            passwordInput.type === "password";


        passwordInput.type =
            isPassword
                ? "text"
                : "password";


        this.innerHTML =
            isPassword
                ? '<i class="bi bi-eye-slash"></i>'
                : '<i class="bi bi-eye"></i>';

    }
);


// ==========================================
// REGISTER
// ==========================================

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Clear messages

        registerError.classList.add(
            "d-none"
        );

        registerSuccess.classList.add(
            "d-none"
        );


        // Get form values

        const firstName =
            document
                .getElementById("firstName")
                .value
                .trim();

        const lastName =
            document
                .getElementById("lastName")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            passwordInput.value;


        // ======================================
        // CLIENT-SIDE VALIDATION
        // ======================================

        if (!firstName || !lastName) {

            showError(
                "First name and last name are required."
            );

            return;

        }


        if (!email) {

            showError(
                "Email address is required."
            );

            return;

        }


        if (password.length < 6) {

            showError(
                "Password must contain at least 6 characters."
            );

            return;

        }


        // ======================================
        // DISABLE BUTTON
        // ======================================

        registerButton.disabled = true;

        registerButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2">
            </span>

            Creating Account...
        `;


        // ======================================
        // REQUEST
        // ======================================

        try {

            const response =
                await fetch(
                    "/api/auth/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            firstName:
                                firstName,

                            lastName:
                                lastName,

                            email:
                                email,

                            password:
                                password,

                            role:
                                "EMPLOYEE"

                        })

                    }
                );


            const data =
                await response.json()
                    .catch(() => null);


            // ==================================
            // ERROR
            // ==================================

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Registration failed."
                );

            }


            // ==================================
            // SUCCESS
            // ==================================

            registerSuccess.textContent =
                "Account created successfully! Redirecting to login...";

            registerSuccess.classList.remove(
                "d-none"
            );


            registerForm.reset();


            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1500
            );


        } catch (error) {

            console.error(error);


            showError(
                error.message ||
                "Unable to create account."
            );


        } finally {

            registerButton.disabled =
                false;

            registerButton.innerHTML = `
                <i class="bi bi-person-plus me-1"></i>
                Create Account
            `;

        }

    }
);


// ==========================================
// ERROR HELPER
// ==========================================

function showError(message) {

    registerError.textContent =
        message;

    registerError.classList.remove(
        "d-none"
    );

}