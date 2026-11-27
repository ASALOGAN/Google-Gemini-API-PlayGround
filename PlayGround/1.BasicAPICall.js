import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { trackUsage } from "../usage/usageTracker.js";

dotenv.config({ path: "../.env", quiet: true });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const main = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "",
  });

  console.log(`Gemini Response:\n${response.text}`);

  // Track usage
  const usageRecord = trackUsage({
    model: "gemini-2.5-flash",
    usage: response.usageMetadata,
    caller: "1.BasicAPICall.js",
  });

  console.log("Usage recorded:", usageRecord);
};

main().catch(console.error);
