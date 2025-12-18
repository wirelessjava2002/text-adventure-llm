const express = require('express');
const cors = require('cors');
require('dotenv').config();

// If using Node < 18, uncomment:
// const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Choose one Cloudflare model
const MODEL_NAME = "@cf/meta/llama-3.1-8b-instruct";
// Alternatives:
// "@cf/openai/llama-3.2-11b-text"
// "@cf/qwen/Qwen2-7B-Instruct"
// "@cf/meta/llama-3.3-70b-instruct"

async function callCloudflareAI(prompt) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL_NAME}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(result, null, 2));
    }

    return result.result.response || "(No response)";
}

app.post('/api/chat', async (req, res) => {
    const timestamp = new Date().toISOString();
    const prompt = req.body.message;

    console.log(`\n[${timestamp}] Prompt:`, prompt);

    if (!prompt) {
        return res.status(400).json({ reply: "Empty prompt." });
    }

    try {
        const reply = await callCloudflareAI(prompt);

        console.log(`[${timestamp}] Reply:`, reply);

        res.json({
            reply,
            modelUsed: MODEL_NAME
        });

    } catch (error) {
        console.error(`[${timestamp}] Error:`, error);
        res.status(500).json({
            reply: "An error occurred.",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 10000;
console.log("🔥 Using Cloudflare Account ID:", process.env.CLOUDFLARE_ACCOUNT_ID);
console.log("🔥 Using Cloudflare API Token:", process.env.CLOUDFLARE_API_TOKEN ? "Loaded" : "NOT LOADED");

app.listen(PORT, () => {
    console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
    console.log(`💡 Using Cloudflare Workers AI model: ${MODEL_NAME}`);
});
