import { GoogleGenAI } from "@google/genai";
import { AdventureType } from "../types";

// In this specific platform environment, the API key is provided securely
// via `process.env.API_KEY`. The platform replaces this placeholder at runtime.
// This is different from the standard Vite `import.meta.env` approach.
const apiKey = process.env.API_KEY;

// DIAGNOSTIC LOG: This will help confirm if the platform is injecting the key.
console.log("[DIAGNOSTIC] Attempting to initialize Gemini with process.env.API_KEY:", apiKey ? "key_found" : "key_not_found");

if (!apiKey) {
  // If you see this error, it means the API key has not been configured
  // in the secrets/environment variable settings of your deployment platform.
  console.error(
    "Gemini API Key is missing from the environment! Please ensure the API_KEY secret is set in your platform's settings."
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