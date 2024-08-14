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
    .then(response => response.json())
    .then(data => {
        displayRecommendations(data.items);
    })
    .catch(error => {
        console.error('Error fetching top tracks:', error);
    });
}

// Display the recommended tracks in the DOM
function displayRecommendations(tracks) {
    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = '<h2>Your Top 10 Tracks:</h2>';

    tracks.forEach(track => {
        const trackElement = document.createElement('p');
        trackElement.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
        recommendationsDiv.appendChild(trackElement);
    });
}
