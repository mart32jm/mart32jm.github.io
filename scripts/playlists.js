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
    const playlistsResponse = await fetch("https://api.spotify.com/v1/me/playlists?limit=10", {
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

    // Call getUserProfile only if accessToken is available
    getUserProfile(accessToken)
        .then(data => {
            const profile = data.profile;
            const playlists = data.playlists;
            populateUI(profile);

            // Display user profile
            document.getElementById("profile-name").textContent = profile.display_name;
            document.getElementById("profile-image").src = profile.images[0].url;


        })
        .catch(error => {
            console.error("Error fetching user profile and playlists:", error);
        });
} else {
    document.getElementById("access-token").textContent = "(No access token found in local storage 😢)";
}

function populateUI(profile) {
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
}

const getRecommendation = async () => {
    try {
        const params = new URLSearchParams({
            limit: 1,
            market: "US",
            seed_genres: ["acoustic", "rock", "pop", "classical"],
        });

        const response = await fetch("https://api.spotify.com/v1/recommendations?" + params, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("access_token"),
            }
        });

        if (!response.ok) {
            if (response.status === 429) {
                alert("Too many requests! Please try again later.");
                window.location.href = "index.html";
            }
            throw new Error("Failed to get song recommendation!");
        }
        
        // Display the song recommendation
        const data = await response.json();
        const song = data.tracks[0];

        document.getElementById("song-img").src = song.album.images[0].url;
        document.getElementById("song-title").textContent = song.name + (song.explicit ? " (Explicit 🔥)" : "");
        document.getElementById("song-artist").textContent = song.artists[0].name;
        document.getElementById("song-display").hidden = false;

        // Store the song URI for later use
        document.getElementById("song-play-btn").href = song.external_urls.spotify;
        document.getElementById("song-save-btn").dataset.songId = song.id; // Store the song ID in a data attribute on the element
    } catch (error) {
        alert(error);
    }
}

getRecommendation(); // Don't forget to call the function!

