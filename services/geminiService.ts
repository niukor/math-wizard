import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMathStory = async (dividend: number, divisor: number): Promise<string> => {
  const client = getClient();
  if (!client) return "请输入 API Key 来获取神奇的数学故事！";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `为四年级学生创作一个非常简短、有趣的一句话数学应用题。使用除法算式：${dividend} 除以 ${divisor}。使用简单的名字和物品（如饼干、玩具、贴纸）。不要解答，只需设定情景。请用中文回答。`,
    });
    return response.text || "让我们一起解开这道题！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "让我们一步步算出来！";
  }
};

export const generateEncouragement = async (stepType: string): Promise<string> => {
   const client = getClient();
   if (!client) return "";
   
   try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `给正在做长除法的小学生一句非常简短（5个字以内）的中文鼓励语。当前步骤是"${stepType}"。可以使用表情符号。`,
    });
    return response.text.trim();
  } catch (error) {
    return "";
  }
}
