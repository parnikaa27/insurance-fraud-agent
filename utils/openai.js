import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log("Loaded GROQ KEY:", process.env.GROQ_API_KEY);

export const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});