
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Safely initializes the Google GenAI instance.
 * @throws Error if API_KEY is missing or invalid.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    throw new Error("MISSING_API_KEY");
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    throw new Error("INITIALIZATION_FAILED");
  }
};

export const analyzeSystemHealth = async (metrics: any) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these system metrics and provide a 1-sentence assessment: ${JSON.stringify(metrics)}`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message === "MISSING_API_KEY") {
      return "AI Assessment Disabled: System Identity Key not found in environment.";
    }
    return "AI Assessment Offline: Connection to logic layer interrupted.";
  }
};

export const getTradingAdvice = async (marketData: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Act as a senior quantitative trader. Based on these levels, evaluate the risk profile: ${marketData}`,
      config: {
        systemInstruction: "You are the Logic Layer of Agent Edge. Provide cold, objective, deterministic analysis.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            bias: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ["riskLevel", "bias", "recommendation"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    return null;
  }
};

/**
 * Checks if the AI service is ready to be used.
 */
export const checkAIServiceStatus = (): { ready: boolean; error?: string } => {
  try {
    getAI();
    return { ready: true };
  } catch (error: any) {
    if (error.message === "MISSING_API_KEY") {
      return { ready: false, error: "Environment API_KEY is missing. AI features are restricted." };
    }
    return { ready: false, error: "AI Engine failed to initialize. Check system logs." };
  }
};
