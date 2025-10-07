import { GoogleGenAI } from "@google/genai";
import { AdventureType } from "../types";

// This value is injected at build time by the `define` property in `vite.config.ts`.
const apiKey = import.meta.env.GEMINI_API_KEY_INJECTED;

// Diagnostic log to verify the key value in the browser's console.
console.log("[DIAGNOSTIC] Attempting to initialize Gemini with API Key:", apiKey);

if (!apiKey) {
  console.error(
    "Gemini API Key is missing! Ensure VITE_GEMINI_API_KEY is set in your .env.local file and that the project has been built correctly."
  );
}

// Initialize the GoogleGenAI client with the injected API key.
const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateDescription = async (title: string, keywords: string, adventureType: AdventureType): Promise<string> => {
  const prompt = `
    Create a friendly and engaging adventure description for a travel and housing app.
    The description should be inviting and clear. Do not use hashtags.
    Keep it concise, around 2-3 sentences.
    Base the description on the provided details.

    Adventure Type: "${adventureType}"
    Adventure Title: "${title}"
    Keywords: "${keywords}"

    Generated Description:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    return text?.trim() ?? "There was an error generating the description. Please try again.";
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "There was an error generating the description. Please try again.";
  }
};
