// @google/genai-api-key
import { GoogleGenAI } from "@google/genai";

// Fix: Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDescription = async (title: string, keywords: string): Promise<string> => {
  const prompt = `
    Create a friendly and engaging adventure description for a travel and housing app.
    The description should be inviting and clear. Do not use hashtags.
    Keep it concise, around 2-3 sentences.

    Adventure Title: "${title}"
    Keywords: "${keywords}"

    Generated Description:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Fix: Access the 'text' property directly instead of calling a method.
    const text = response.text;
    return text?.trim() ?? "There was an error generating the description. Please try again.";
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "There was an error generating the description. Please try again.";
  }
};