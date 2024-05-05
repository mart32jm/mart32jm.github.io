document.getElementById('authorize').addEventListener('click', () => {
    // Get client ID and redirect URI
    const clientId = 'bca2a89f33694250b5b79633e3435a39';
    const redirectUri = 'https://mart32jm.github.io/design/login.html';
    // Generate a code verifier
    const codeVerifier = generateRandomString(128);
    // Generate code challenge
    generateCodeChallenge(codeVerifier)
        .then(codeChallenge => {
            localStorage.setItem('code_verifier', codeVerifier);
            const state = generateRandomString(16);
            const scope = 'user-read-private user-read-email user-modify-playback-state';
            const args = new URLSearchParams({
                response_type: 'code',
                client_id: clientId,
                scope: scope,
                redirect_uri: redirectUri,
                state: state,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge
            });
            window.location = 'https://accounts.spotify.com/authorize?' + args;
        });
});

// After authorization and token grabbing, automatically fetch and display user's profile
const token = localStorage.getItem('access_token');
if (token) {
    getUserProfile(token)
        .then((profile) => {
            document.getElementById('profile-image').src = profile.images[profile.images.length - 1].url;
            document.getElementById('profile-name').textContent = profile.display_name;
            document.getElementById('profile-info').style.display = 'block';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function getUserProfile(accessToken) {
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
    }
    return await response.json();
}

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = window.crypto.subtle.digest('SHA-256', data);

    return digest.then(d => base64encode(d));
}
