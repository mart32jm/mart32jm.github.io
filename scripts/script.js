// Based on code from https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

/**
 * Generates a random string of the specified length.
 * @param {number} length - The length of the random string to generate.
 * @returns {string} The randomly generated string.
 */
const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

/**
 * Calculates the SHA-256 hash of the given plain text.
 * @param {string} plain - The plain text to be hashed.
 * @returns {Promise<ArrayBuffer>} A promise that resolves to the SHA-256 hash as an ArrayBuffer.
 */
const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

/**
 * Encodes the input string using Base64 encoding.
 *
 * @param {ArrayBuffer} input - The input string to be encoded.
 * @returns {string} The Base64 encoded string.
 */
const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

/**
 * Generates a code challenge for the Spotify API authorization flow.
 * @returns {Promise<[string, string]>} A promise that resolves to an array containing the verifier and challenge.
 */
const generateCodeChallenge = async () => {
    const verifier = generateRandomString(64);
    const challenge = base64encode(await sha256(verifier));
    return [verifier, challenge];
}

/**
 * Requests authorization code from the Spotify API.
 *
 * @param {string} clientId - The client ID of your Spotify application.
 * @param {string} redirectUri - The redirect URI where Spotify will send the authorization code.
 * @param {string} codeChallenge - The code challenge generated for PKCE (Proof Key for Code Exchange).
 * @param {string} [reqScopes] - The requested scopes for the authorization.
 */
const requestAuthCode = (clientId, redirectUri, codeChallenge, reqScopes = 'user-read-private user-read-email') => {
    const scope = reqScopes;
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const params = {
        response_type: "code",
        client_id: clientId,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

/**
 * Retrieves an access token from the Spotify API using the provided authorization code.
 * @param {string} clientId - The client ID of your Spotify application.
 * @param {string} redirectUri - The redirect URI used in the Spotify authorization flow.
 * @param {string} authCode - The authorization code obtained from the Spotify authorization flow.
 * @param {string} codeVerifier - The code verifier used in the Spotify authorization flow.
 * @returns {Promise<Object>} - A promise that resolves to the access token object.
 * @throws {Error} - If the API request fails or returns an error, an error is thrown with the error message.
 */
const getToken = async (clientId, redirectUri, authCode, codeVerifier) => {
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: redirectUri,
            code: authCode,
            code_verifier: codeVerifier,
        }),
    }

    const response = await fetch("https://accounts.spotify.com/api/token", payload);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(`${data.error}: ${data.error_description}`);
    }

    return data;
}

/**
 * Refreshes the access token using the provided client ID and refresh token.
 * @param {string} clientId - The client ID for the Spotify API.
 * @param {string} refreshToken - The refresh token for the user's session.
 * @returns {Promise<Object>} - A promise that resolves to the refreshed access token data.
 * @throws {Error} - If there is an error refreshing the access token.
 */
const getRefreshToken = async (clientId, refreshToken) => {
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            refresh_token: refreshToken,
        }),
    }

    const response = await fetch("https://accounts.spotify.com/api/token", payload);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(`${data.error}: ${data.error_description}`);
    }

    return data;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// Below is the code for the tutorial

const getUserProfile = async (accessToken) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`${data.error.message}`);
    }

    return data;
}

// Set up code verifier and code challenge

const displayCodeChallenge = async (verifier, challenge) => {
    document.getElementById("code-verifier").textContent = verifier;
    document.getElementById("code-challenge").textContent = challenge;
    document.getElementById("code-verifier-body").textContent = verifier;
}

const createNewCodes = () => {
    return generateCodeChallenge().then(([verifier, challenge]) => {
        localStorage.setItem("code_verifier", verifier);
        codeVerifier = verifier;
        codeChallenge = challenge;
        displayCodeChallenge(verifier, challenge);
    });
}

let codeVerifier = localStorage.getItem("code_verifier");
let codeChallenge = "";

if (!codeVerifier) {
    createNewCodes();
} else {
    sha256(codeVerifier).then((challenge) => {
        codeChallenge = base64encode(challenge);
        displayCodeChallenge(codeVerifier, codeChallenge);
    });
}

// Code for synchronized fields

if (!localStorage.getItem("redirect_uri")) {
    // Set default redirect URI
    let redirectUri = window.location.origin + window.location.pathname;
    // redirectUri = redirectUri.replace("127.0.0.1", "localhost");
    localStorage.setItem("redirect_uri", redirectUri);
}

const loadSyncFields = () => {
    const elements = document.querySelectorAll("[data-sync]");
    for (let element of elements) {
        const field = element.getAttribute("data-sync");
        const value = localStorage.getItem(field);
        if (value) {
            if (element.tagName === "INPUT") {
                element.value = value;
            } else {
                element.textContent = value;
            }
        }
    }
}

loadSyncFields();

const syncFields = (field) => {
    return (event) => {
        const value = event.target.value;
        const elements = document.querySelectorAll(`[data-sync="${field}"]`);
        for (let element of elements) {
            // Skip if element is the same as the event target
            if (element === event.target) {
                continue;
            }

            if (element.tagName === "INPUT") {
                element.value = value;
            } else {
                element.textContent = value;
            }
        }
        
        // Also store in local storage
        localStorage.setItem(field, value);
    }
}

// Populate auth code if present in URL

const urlParams = new URLSearchParams(window.location.search);
const authCode = urlParams.get("code");

if (authCode) {
    window.location.hash = "#try-login";
    document.getElementById("auth-code").textContent = authCode;
    document.getElementById("auth-code-body").textContent = authCode;
} else {
    document.getElementById("auth-code").textContent = "(No auth code found in URL 😢)";
}

// Read access token from local storage

let accessToken = localStorage.getItem("access_token");
if (accessToken) {
    document.getElementById("access-token").textContent = accessToken;
} else {
    document.getElementById("access-token").textContent = "(No access token found in local storage 😢)";
}

// Set up event handlers

document.getElementById("paste-client-id").addEventListener("change", syncFields("client_id"));
document.getElementById("login-client-id").addEventListener("change", syncFields("client_id"));
document.getElementById("login-redirect-uri").addEventListener("change", syncFields("redirect_uri"));

document.getElementById("generate-button").addEventListener("click", createNewCodes);

document.getElementById("login-button").addEventListener("click", () => {
    const clientId = document.getElementById("login-client-id").value;
    const redirectUri = document.getElementById("login-redirect-uri").value;

    if (!clientId || !redirectUri) {
        alert("Please provide a client ID and redirect URI.");
        return;
    }

    requestAuthCode(clientId, redirectUri, codeChallenge);
});

document.getElementById("token-button").addEventListener("click", () => {
    const clientId = document.getElementById("login-client-id").value;
    const redirectUri = document.getElementById("login-redirect-uri").value;

    if (!clientId || !authCode || !redirectUri) {
        alert("Please provide a client ID, auth code, and redirect URI.");
        return;
    }

    getToken(clientId, redirectUri, authCode, codeVerifier).then((data) => {
        accessToken = data.access_token;
        document.getElementById("access-token").textContent = accessToken;
        localStorage.setItem("access_token", accessToken);
        alert("Access token received and stored in local storage.");
    }).catch((error) => {
        alert(`Error: ${error.message}`);
    });
});

document.getElementById("profile-button").addEventListener("click", () => {
    if (!accessToken) {
        alert("Please get an access token first.");
        return;
    }

    getUserProfile(accessToken).then((profile) => {
        document.getElementById("profile-image").src = profile.images[profile.images.length - 1].url;
        document.getElementById("profile-name").textContent = profile.display_name;
    }).catch((error) => {
        alert(`Error: ${error.message}`);
    });
});

//
////////////////////////////////////////