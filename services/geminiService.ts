import { GoogleGenAI } from "@google/genai";

export const completeText = async (currentText: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return " [AI Config Missing] ";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We want a subtle completion, not a full novel.
    const prompt = `
      You are a ghostwriter inside a typewriter. 
      Continue the following text naturally with 1 or 2 sentences. 
      Match the tone and style perfectly. 
      Do not repeat the prompt. 
      Only return the continuation.
      
      Current Text:
      "${currentText}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};
