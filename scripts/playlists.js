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

document.getElementById('get-top-tracks').addEventListener('click', function() {
    getTopTracks(access_token);                                       
  });
  
  document.getElementById('getrecommendations').addEventListener('click', function() {  
    getRecommendations(access_token)
  });

  function getTopTracks(access_token) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/top/tracks?limit=10',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
      success: function(response) {
        $(".recommendations").show();
        mapOverSongs(response.items);
      }
    });
  }

  function mapOverSongs(songs) {
    $("#getrecommendations").show();
    songs.map( function(song) {
          var list = "<input type='checkbox' name='top-tracks' value='" +
                  song.id + "'>" +
                  "<a href='" + song.external_urls.spotify + "'>" +
                  song.name +
                  " by " + song.artists[0].name +
                  " from the album " + song.album.name +
                  "</a><br><br>";
          document.getElementById('top-tracks').innerHTML += list;
    });
}

function getRecommendations(access_token) {
    var checkboxes = document.getElementsByName('top-tracks');
    var selected = "";
    for (var i=0, n=checkboxes.length; i<n; i++) {
        if (checkboxes[i].checked) {
            selected += checkboxes[i].value+",";
        }
    }
    selected = selected.slice(0, -1);
    $.ajax({
        url: 'https://api.spotify.com/v1/recommendations?market=US&seed_tracks=' + selected + '&limit=10',
        headers: {
        'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            mapOverRecommendations(response.tracks);
        }
    });
}

function mapOverRecommendations(recommendations) {
    $(".recommendations-table").show();
    recommendations.map(function (song) {
      var list =
          "<tr><td><a target='_blank' href='" + song.external_urls.spotify + "'>" + song.name + "</a></td><td>" + song.artists[0].name + "</td><td>" + song.album.name + "</td></tr>";
      document.getElementById('recommendations').innerHTML += list;
    });
  }
