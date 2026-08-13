import { GoogleGenAI } from "@google/genai"; 
 
export const chatWithAI = async (req, res) => { 
  try { 
    const { message } = req.body; 
 
    if (!message?.trim()) { 
      return res.status(400).json({ 
        success: false, 
        message: "Message is required", 
      }); 
    } 
 
    if (!process.env.GEMINI_API_KEY) { 
      return res.status(500).json({ 
        success: false, 
        message: "Gemini API key is not configured", 
      }); 
    } 
 
    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY, 
    }); 
 
    const response = await ai.models.generateContent({
  model: "gemini-3.6-flash",

  contents: `
You are CampusConnect AI Study Assistant.

Help college students with:
- topic explanations
- summaries
- quizzes
- viva preparation
- study plans
- examples
- exam preparation

Response rules:
- Keep answers concise and easy to understand.
- Prefer 5-8 short points.
- Use simple language.
- Give a small example when useful.
- Avoid very long introductions.
- Do not overuse emojis.
- For viva questions, give direct answers.
- For quizzes, give only the requested number of questions.
- If the student asks for a detailed explanation, then explain step by step.

Student question:
${message}
  `,
});
 
    return res.status(200).json({ 
      success: true, 
      reply: response.text, 
    }); 
  } catch (error) { 
    console.error("Gemini AI error:", error); 
 
    return res.status(500).json({ 
      success: false, 
      message: "AI assistant failed to respond", 
      error: error.message, 
    }); 
  } 
}; 