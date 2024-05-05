let accessToken = localStorage.getItem("access_token");
if (accessToken) {
    document.getElementById("access-token").textContent = accessToken;
} else {
    document.getElementById("access-token").textContent = "(No access token found in local storage 😢)";
}


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