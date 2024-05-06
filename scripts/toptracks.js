const accessToken = localStorage.getItem("access_token");
const getRecommendation = async () => {
    try {
        const params = new URLSearchParams({
            limit: 1,
            market: "US",
            seed_genres: ["acoustic", "rock", "pop", "classical"],
        });

        const response = await fetch("https://api.spotify.com/v1/recommendations?" + params, {
            headers: {
                Authorization: 'Bearer ' + accessToken,
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