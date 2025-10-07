import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AdventureType } from "../types";

/**
 * A utility function to safely trim and remove extraneous characters 
 * (like quotes or trailing commas) from environment variables.
 * @param variable The environment variable string.
 * @returns A cleaned string.
 */
const cleanEnvVar = (variable: string | undefined): string => {
    if (!variable) {
        return '';
    }
    let cleaned = variable.trim();
    // Remove a single trailing comma if it exists
    if (cleaned.endsWith(',')) {
        cleaned = cleaned.slice(0, -1);
    }
    // Remove quotes if the string is wrapped in them
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
};

// Vite exposes environment variables on the `import.meta.env` object.
// VITE_GEMINI_API_KEY is defined in your .env.local file and will be
// embedded during the build process.
const apiKey = cleanEnvVar(import.meta.env.VITE_GEMINI_API_KEY);

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
    
    // Fix: Safely access the .text property using optional chaining (?.) to prevent
    // the "possibly 'undefined'" TypeScript error during build.
    const text = response.text?.trim();
    return text || "There was an error generating the description. Please try again.";
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "There was an error generating the description. Please try again.";
  }
};