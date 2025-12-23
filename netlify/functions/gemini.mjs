import { GoogleGenAI } from "@google/genai";

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in environment variables.");
      return new Response(JSON.stringify({ error: "Server configuration error: API Key missing." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await req.json();
    const { mode, currentContent, instruction, prompt, image } = body;
    
    const ai = new GoogleGenAI({ apiKey });
    let contentsPayload;

    if (mode === 'general') {
        if (!prompt) {
            return new Response(JSON.stringify({ error: "Missing prompt." }), { status: 400 });
        }

        const parts = [];
        
        // Add Image if present (Multimodal)
        if (image) {
            // Expecting data:image/xyz;base64,....
            const match = image.match(/^data:(.*?);base64,(.*)$/);
            if (match) {
                parts.push({
                    inlineData: {
                        mimeType: match[1],
                        data: match[2]
                    }
                });
            }
        }

        // Add Text Prompt
        parts.push({ text: prompt });
        
        contentsPayload = { parts };

    } else {
        // Default: Rewrite Mode
        if (!currentContent || !instruction) {
            return new Response(JSON.stringify({ error: "Missing content or instruction." }), { status: 400 });
        }

        const systemPrompt = `
          Role: Professional Resume Editor.
          Task: Rewrite the following resume content based on this instruction: "${instruction}".
          
          Content to Rewrite:
          "${currentContent}"
          
          Constraint: Return ONLY the improved HTML code suitable for insertion into a <div> or <ul>. Do not add markdown blocks like \`\`\`html. Keep formatting simple.
        `;
        
        contentsPayload = systemPrompt;
    }

    // Call the model
    // gemini-3-flash-preview supports both text and multimodal inputs efficiently
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: contentsPayload,
    });

    let result = response.text || '';
    
    // Clean up markdown code blocks if present (common in text responses)
    result = result.replace(/```html/g, '').replace(/```/g, '').trim();

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Gemini Function Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process AI request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};