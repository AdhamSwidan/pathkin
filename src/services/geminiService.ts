import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AdventureType } from "../types";

// Vite exposes environment variables on the `import.meta.env` object.
// VITE_GEMINI_API_KEY is defined in your .env.local file and will be
// embedded during the build process.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// DIAGNOSTIC LOG: This will help confirm if the build process is injecting the key.
console.log("[DIAGNOSTIC] Attempting to initialize Gemini with import.meta.env.VITE_GEMINI_API_KEY:", apiKey ? "key_found" : "key_not_found");

if (!apiKey) {
  // If you see this error, it means the VITE_GEMINI_API_KEY has not been configured
  // in the .env.local file or in the environment variable settings of your deployment platform.
  console.error(
    "Gemini API Key is missing from the environment! Please ensure the VITE_GEMINI_API_KEY is set."
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
    // Fix: Add GenerateContentResponse type to the response object as per guidelines.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Fix: Use response.text and handle potential empty string case.
    const text = response.text;
    return text.trim() || "There was an error generating the description. Please try again.";
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "There was an error generating the description. Please try again.";
  }
};
