
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we'll proceed, but API calls will fail.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDescription = async (title: string, keywords: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI functionality is disabled. Please set your API_KEY.");
  }

  const prompt = `
    Create a friendly and engaging post description for a travel and housing app.
    The post should be inviting and clear. Do not use hashtags.
    Keep it concise, around 2-3 sentences.

    Post Title: "${title}"
    Keywords: "${keywords}"

    Generated Description:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // FIX: Safely access response.text to satisfy strict compiler checks.
    return (response.text ?? '').trim();
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "There was an error generating the description. Please try again.";
  }
};