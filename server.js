const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const app = express();

const CLIENT_ID = '4a6baa63ea2641ada0e3e9c1f8e50a84';
const CLIENT_SECRET = '05145083e7b94c3e90d9b66277164318';
const REDIRECT_URI = 'http://localhost:3000/callback';

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
                seed_genres: 'pop', // Example parameter, update as needed
                limit: 10
            }
        });

        // Render recommendations
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="/styles.css">
                <title>Recommendations</title>
            </head>
            <body>
                <div class="container">
                    <h1>Recommendations</h1>
                    <ul>
                        ${recommendationsResponse.data.tracks.map(track => `
                            <li>
                                <strong>${track.name}</strong> by ${track.artists.map(artist => artist.name).join(', ')}
                            </li>
                        `).join('')}
                    </ul>
                    <a href="/">Back to Home</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error obtaining access token or recommendations:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
