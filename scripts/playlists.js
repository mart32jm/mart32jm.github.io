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

    // Call getUserProfile only if accessToken is available
    getUserProfile(accessToken)
        .then(data => {
            const profile = data.profile;
            const playlists = data.playlists;
            populateUI(profile);
            console.log(playlists);

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

async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method,
      body:JSON.stringify(body)
    });
    return await res.json();
  }
  
  async function getTopTracks(){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    return (await fetchWebApi(
      'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
    )).items;
  }
  
  const topTracks = await getTopTracks();
  console.log(
    topTracks?.map(
      ({name, artists}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );