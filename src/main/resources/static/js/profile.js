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
// GET USER INFORMATION FROM JWT
// ==========================================

function loadProfile() {

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


        const email =
            payload.sub || "User";


        const role =
            payload.role || "USER";


        /*
         * Your current JWT contains the
         * email/subject and role.
         *
         * If firstName/lastName are not
         * present in the token, we display
         * the email as the account identity.
         */


        document
            .getElementById(
                "profileEmail"
            )
            .textContent =
                email;


        document
            .getElementById(
                "profileEmailValue"
            )
            .textContent =
                email;


        document
            .getElementById(
                "profileRole"
            )
            .textContent =
                role;


        document
            .getElementById(
                "profileRoleValue"
            )
            .textContent =
                role;


        document
            .getElementById(
                "profileName"
            )
            .textContent =
                email.split("@")[0];


        document
            .getElementById(
                "profileFirstName"
            )
            .textContent =
                email.split("@")[0];


    } catch (error) {

        console.error(
            "Unable to load profile:",
            error
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

loadProfile();