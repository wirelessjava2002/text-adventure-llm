const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/chat', async (req, res) => {
  try {
    const prompt = req.body.message;
    const result = await model.generateContent([prompt]);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ reply: 'An error occurred.' });
  }
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
