const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    errorMessage.classList.add("d-none");

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Invalid email or password"
            );

        }

        /*
         * Store JWT token.
         */
        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "tokenType",
            data.tokenType || "Bearer"
        );

        /*
         * Redirect to dashboard.
         */
        window.location.href = "dashboard.html";

    } catch (error) {

        errorMessage.textContent = error.message;

        errorMessage.classList.remove("d-none");

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Login";

    }

});