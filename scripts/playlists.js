const getUserProfile = async (accessToken) => {
    // Fetch user profile
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
        throw new Error(`${profileData.error.message}`);
    }

    // Fetch user's playlists
    const playlistsResponse = await fetch("https://api.spotify.com/v1/me/playlists?limit=5", {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });

    const playlistsData = await playlistsResponse.json();
    if (!playlistsResponse.ok) {
        throw new Error(`${playlistsData.error.message}`);
    }

    return { profile: profileData, playlists: playlistsData.items };
};

const accessToken = localStorage.getItem("access_token");
if (accessToken) {
    // Display an alert message
    window.alert(accessToken);

    // Call getUserProfile only if accessToken is available
    getUserProfile(accessToken)
        .then(data => {
            const profile = data.profile;
            const playlists = data.playlists;

            // Display user profile
            document.getElementById("profile-name").textContent = profile.display_name;
            document.getElementById("profile-image").src = profile.images[0].url;

            // Display playlists
            const playlistsList = document.getElementById("playlists-list");
            playlists.forEach(playlist => {
                const playlistItem = document.createElement("li");
                playlistItem.textContent = playlist.name;
                playlistsList.appendChild(playlistItem);
            });
        })
        .catch(error => {
            console.error("Error fetching user profile and playlists:", error);
        });
} else {
    document.getElementById("access-token").textContent = "(No access token found in local storage 😢)";
}
