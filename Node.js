const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const clientId = 'YOUR_SPOTIFY_CLIENT_ID'; // Replace with your Client ID
    const clientSecret = 'YOUR_SPOTIFY_CLIENT_SECRET'; // Replace with your Client Secret
    const redirectUri = 'YOUR_REDIRECT_URI'; // Replace with your redirect URI

    // Exchange code for access token
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
    }), {
        headers: {
            'Authorization': `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const accessToken = tokenResponse.data.access_token;

    // Use the access token to fetch recommendations
    // Example: Fetch user profile
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    // Send recommendations or user profile data back to the client
    res.json(profileResponse.data);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
