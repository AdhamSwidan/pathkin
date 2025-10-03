import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateDescription = async (title: string, keywords: string): Promise<string> => {
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
    
    const text = response.text;
    return text?.trim() ?? "There was an error generating the description. Please try again.";
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "There was an error generating the description. Please try again.";
  }
};