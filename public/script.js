document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const recommendationsContainer = document.getElementById('recommendations');

    // Spotify authorization URL
    const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
            client_id: '4a6baa63ea2641ada0e3e9c1f8e50a84',
            response_type: 'code',
            redirect_uri: 'https://mouri69-recommender.vercel.app/callback',
            scope: 'user-library-read',
        }).toString();

    loginButton.addEventListener('click', () => {
        window.location.href = SPOTIFY_AUTH_URL;
    });

    // Fetch recommendations from the server
    const fetchRecommendations = async () => {
        try {
            const response = await fetch('/callback');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const recommendations = await response.json();
            console.log('Fetched recommendations:', recommendations); // Debugging line
            displayRecommendations(recommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const displayRecommendations = (recommendations) => {
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            recommendationsContainer.innerHTML = '<p>No recommendations available.</p>';
            return;
        }

        recommendationsContainer.innerHTML = `
            <h2>Recommended Songs</h2>
            ${recommendations.map(track => `
                <div class="recommendation-item">
                    <img src="${track.album_image}" alt="${track.album}" class="album-image">
                    <div class="track-info">
                        <p><strong>${track.name}</strong> by ${track.artists}</p>
                        <p>${track.album} (${track.release_date})</p>
                        ${track.preview_url ? `<audio controls><source src="${track.preview_url}" type="audio/mpeg">Your browser does not support the audio element.</audio>` : ''}
                    </div>
                </div>
            `).join('')}
        `;
    };

    fetchRecommendations();
});
