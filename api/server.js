const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const app = express();

const CLIENT_ID = '4a6baa63ea2641ada0e3e9c1f8e50a84';
const CLIENT_SECRET = '05145083e7b94c3e90d9b66277164318';
const REDIRECT_URI = 'https://mouri69-recommender.vercel.app/callback';

// Serve static files from the public directory
app.use(express.static('public'));

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('No authorization code found.');
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token } = response.data;

        const recommendationsResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                seed_genres: 'pop,hip-hop,rock', // Example genres
                limit: 10
            }
        });

        res.json(recommendationsResponse.data.tracks.map(track => ({
            name: track.name,
            artists: track.artists.map(artist => artist.name).join(', '),
            album: track.album.name,
            release_date: track.album.release_date,
            album_image: track.album.images[0].url,
            preview_url: track.preview_url
        })));
    } catch (error) {
        console.error('Error obtaining access token or recommendations:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
