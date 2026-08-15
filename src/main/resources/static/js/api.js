// ==========================================
// EMS - CENTRAL API HELPER
// ==========================================

const API_BASE_URL = "/api";


// ==========================================
// TOKEN
// ==========================================

function getToken() {
    return localStorage.getItem("token");
}


// ==========================================
// BUILD API URL
// ==========================================

function buildApiUrl(endpoint) {

    if (!endpoint) {
        return API_BASE_URL;
    }

    // If endpoint already contains /api,
    // don't add /api again.
    if (endpoint.startsWith("/api/")) {
        return endpoint;
    }

    // Normal endpoint:
    // /departments -> /api/departments
    return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
}


// ==========================================
// COMMON API REQUEST
// ==========================================

async function apiRequest(endpoint, options = {}) {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };


    // ======================================
    // ADD JWT
    // ======================================

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }


    // ======================================
    // BUILD URL
    // ======================================

    const url = buildApiUrl(endpoint);

    console.log("API Request:", url);


    // ======================================
    // SEND REQUEST
    // ======================================

    let response;

    try {

        response = await fetch(
            url,
            {
                ...options,
                headers
            }
        );

    } catch (error) {

        console.error("Network error:", error);

        throw new Error(
            "Unable to connect to the server."
        );
    }


    // ======================================
    // READ RESPONSE
    // ======================================

    const contentType =
        response.headers.get("content-type") || "";

    let data = null;

    try {

        if (contentType.includes("application/json")) {

            data = await response.json();

        } else {

            data = await response.text();

        }

    } catch (error) {

        console.error(
            "Unable to read server response:",
            error
        );

        data = null;
    }


    // ======================================
    // 401 - UNAUTHORIZED
    // ======================================

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("tokenType");

        alert(
            "Session expired. Please login again."
        );

        window.location.href = "login.html";

        throw new Error("Unauthorized");
    }


    // ======================================
    // 403 - FORBIDDEN
    // ======================================

    if (response.status === 403) {

        let message =
            "You do not have permission to perform this action.";

        if (data && typeof data === "object") {

            message =
                data.message ||
                data.error ||
                message;

        } else if (typeof data === "string" && data.trim()) {

            message = data;

        }

        throw new Error(message);
    }


    // ======================================
    // 404 - NOT FOUND
    // ======================================

    if (response.status === 404) {

        let message =
            "Requested resource was not found.";

        if (data && typeof data === "object") {

            message =
                data.message ||
                data.error ||
                message;

        } else if (typeof data === "string" && data.trim()) {

            message = data;

        }

        throw new Error(message);
    }


    // ======================================
    // OTHER ERRORS
    // ======================================

    if (!response.ok) {

        let message =
            "Something went wrong.";

        if (data && typeof data === "object") {

            message =
                data.message ||
                data.error ||
                message;

        } else if (typeof data === "string" && data.trim()) {

            message = data;

        }

        throw new Error(message);
    }


    // ======================================
    // SUCCESS
    // ======================================

    return data;
}


// ==========================================
// GET
// ==========================================

async function apiGet(endpoint) {

    return apiRequest(endpoint, {
        method: "GET"
    });
}


// ==========================================
// POST
// ==========================================

async function apiPost(endpoint, body) {

    return apiRequest(endpoint, {

        method: "POST",

        body: JSON.stringify(body)

    });
}


// ==========================================
// PUT
// ==========================================

async function apiPut(endpoint, body) {

    return apiRequest(endpoint, {

        method: "PUT",

        body: JSON.stringify(body)

    });
}


// ==========================================
// DELETE
// ==========================================

async function apiDelete(endpoint) {

    return apiRequest(endpoint, {

        method: "DELETE"

    });
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("organization");

    window.location.href = "login.html";
}