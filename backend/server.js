const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const recentRequests = new Map();

app.post('/api/chat', async (req, res) => {
    const timestamp = new Date().toISOString();
    const prompt = req.body.message;

      // Log client's full request details
    console.log(`[${timestamp}] Client Request Received:`);
    console.log(`Body:`, req.body); // Logs the request body, whole prompt

    // Check if the prompt was recently processed
    if (recentRequests.has(prompt)) {
        console.log(`[${timestamp}] Duplicate prompt detected:`, prompt);
        return res.status(429).json({ reply: 'Duplicate request detected.' });
    }

    try {
        // Add to recent requests with a 10-second TTL
        recentRequests.set(prompt, true);
        setTimeout(() => recentRequests.delete(prompt), 10000);

        const result = await model.generateContent([prompt]);
        console.log(`[${timestamp}] Response generated:`, result.response.text());
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error(`[${timestamp}] Error:`, error);
        res.status(500).json({ reply: 'An error occurred.' });
    }
});


const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
