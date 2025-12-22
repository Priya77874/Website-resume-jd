import { GoogleGenAI } from "@google/genai";

// Declaration to prevent TypeScript build errors since we are using vite.define to polyfill process.env
declare const process: { env: { API_KEY: string } };

export const rewriteContent = async (
  currentContent: string,
  instruction: string
): Promise<string> => {
  // Guideline: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Role: Professional Resume Editor.
      Task: Rewrite the following resume content based on this instruction: "${instruction}".
      
      Content to Rewrite:
      "${currentContent}"
      
      Constraint: Return ONLY the improved HTML code suitable for insertion into a <div> or <ul>. Do not add markdown blocks like \`\`\`html. Keep formatting simple.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    let result = response.text || '';
    // Clean markdown if present
    result = result.replace(/```html/g, '').replace(/```/g, '').trim();
    return result;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate content. Check your API Key configuration.");
  }
};