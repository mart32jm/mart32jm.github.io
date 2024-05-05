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

const accessToken = localStorage.getItem("access_token");
if (accessToken) {
    // Display an alert message
    window.alert(accessToken);

    // Call getUserProfile only if accessToken is available
    getUserProfile(accessToken)
        .then(profile => {
            document.getElementById("profile-name").textContent = profile.display_name;
            document.getElementById("profile-image").src = profile.images[0].url;
        })
        .catch(error => {
            console.error("Error fetching user profile:", error);
        });
} else {
    document.getElementById("access-token").textContent = "(No access token found in local storage 😢)";
}

