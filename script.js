document.getElementById('login-button').addEventListener('click', () => {
    const clientId = document.getElementById('clientIdInput').value.trim();
    if (!clientId) {
        alert('Please enter a valid Spotify Client ID');
        return;
    }

    const redirectUri = window.location.href; // Use the current page as redirect URI
    const scopes = 'user-library-read user-top-read';

    // Construct the Spotify authorization URL
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

    // Redirect to Spotify login
    window.location.href = authUrl;
});

// After redirect, capture the access token from the URL hash
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        fetchTopTracks(accessToken);
    }
});

// Fetch top tracks using Spotify Web API
function fetchTopTracks(accessToken) {
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const trackIds = data.items.map(track => track.id).slice(0, 5); // Use only the first 5 track IDs
        if (trackIds.length > 0) {
            fetchRecommendations(accessToken, trackIds);
        } else {
            displayRecommendations([]); // No top tracks found
        }
    })
    .catch(error => {
        console.error('Error fetching top tracks:', error);
        // Display an error message to the user
        const recommendationsDiv = document.getElementById('recommendations');
        recommendationsDiv.innerHTML = '<h2>Error fetching top tracks. Please try again later.</h2>';
    });
}

// Fetch song recommendations based on top tracks
function fetchRecommendations(accessToken, trackIds) {
    // Check if there are enough track IDs to generate recommendations
    if (trackIds.length === 0) {
        displayRecommendations([]); // No track IDs to use
        return;
    }

    const recommendationsUrl = new URL('https://api.spotify.com/v1/recommendations');
    recommendationsUrl.searchParams.append('seed_tracks', trackIds.join(','));
    recommendationsUrl.searchParams.append('limit', '10');

    fetch(recommendationsUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayRecommendations(data.tracks);
    })
    .catch(error => {
        console.error('Error fetching recommendations:', error);
        // Display an error message to the user
        const recommendationsDiv = document.getElementById('recommendations');
        recommendationsDiv.innerHTML = '<h2>Error fetching recommendations. Please try again later.</h2>';
    });
}

// Display the recommended tracks in the DOM
function displayRecommendations(tracks) {
    const recommendationsDiv = document.getElementById('recommendations');
    if (!tracks || tracks.length === 0) {
        recommendationsDiv.innerHTML = '<h2>No recommendations available at the moment.</h2>';
        return;
    }

    recommendationsDiv.innerHTML = '<h2>Recommended Tracks Based on Your Top Songs:</h2>';

    tracks.forEach(track => {
        const trackElement = document.createElement('p');
        trackElement.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
        recommendationsDiv.appendChild(trackElement);
    });
}
