import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure your .env file is correct
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant for the website RecipeVault. Give friendly, clear, and creative answers about recipes and cooking tips.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
