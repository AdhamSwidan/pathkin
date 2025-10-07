import { GoogleGenAI } from "@google/genai";
import { AdventureType } from "../types";

// This is the standard Vite way to access environment variables.
// The value comes from your `.env.local` file (for local development)
// or from the environment variables set on your hosting provider (e.g., Vercel).
// For Firebase Hosting, this value is baked in during the `npm run build` step.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// DIAGNOSTIC LOG: Check your browser's console to see what value is being used.
// If it's 'undefined', the environment variable is not configured correctly.
console.log("[DIAGNOSTIC] Attempting to initialize Gemini with VITE_GEMINI_API_KEY:", apiKey);

if (!apiKey) {
  // This error is the final confirmation. If you see this, the environment variable is not being set correctly.
  console.error(
    "Gemini API Key is missing! Ensure VITE_GEMINI_API_KEY is set in your .env.local file AND in your hosting provider's environment variable settings before building."
  );
}

// Initialize the GoogleGenAI client with the API key from the environment.
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
