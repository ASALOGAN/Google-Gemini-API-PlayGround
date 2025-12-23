import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

/* --------------------------------------------
   Load environment variables
-------------------------------------------- */
dotenv.config({
  path: "../.env",
  quiet: true, // suppress dotenv logs
});

/* --------------------------------------------
   Validate configuration
-------------------------------------------- */
const { GEMINI_API_KEY } = process.env;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Check ../.env");
}

/* --------------------------------------------
   Initialize Gemini client
-------------------------------------------- */
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/* --------------------------------------------
   Run example
-------------------------------------------- */
const main = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });

  console.log("Gemini Response:");
  console.log(response.text);
};

main().catch((err) => {
  console.error("Gemini API Error:", err.message);
});
