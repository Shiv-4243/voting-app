const express = require('express');
const { createClient } = require('redis');
const app = express();
const PORT = 3000;

const client = createClient({
    url: 'redis://redis:6379',
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.connect().catch(err => {
    console.error('Could not connect to Redis:', err);
});

let totalVotes = 0;
const votingThreshold = 10;

app.use(express.static('public'));
app.use(express.json());

// Initialize votes
async function initializeVotes() {
    try {
        await client.hSet('votes', 'image1', 0);
        await client.hSet('votes', 'image2', 0);
    } catch (err) {
        console.error('Error initializing votes:', err);
    }
}

initializeVotes();

app.post('/vote/:imageId', async (req, res) => {
    const imageId = req.params.imageId;

    try {
        if (imageId === 'image1') {
            await client.hIncrBy('votes', 'image1', 1);
        } else if (imageId === 'image2') {
            await client.hIncrBy('votes', 'image2', 1);
        }

        totalVotes++;

        if (totalVotes >= votingThreshold) {
            const votes = await client.hGetAll('votes');
            const winner = votes.image1 > votes.image2 ? 'image1' : 'image2';
            totalVotes = 0; // Reset votes for next session
            res.json({ winner, votes });
        } else {
            res.json({ message: 'Vote counted!' });
        }
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Listen on the specified PORT
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
