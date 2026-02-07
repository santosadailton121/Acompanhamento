
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ServiceEntry } from "../types";

// Always create a new GoogleGenAI instance right before the API call using process.env.API_KEY directly.

export const analyzeFinances = async (data: ServiceEntry[]): Promise<string> => {
  // Initialize AI client as per guidelines: new GoogleGenAI({ apiKey: process.env.API_KEY })
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const summary = data.map(s => `${s.date}: ${s.serviceType} para ${s.clientName} - R$${s.value} (${s.paymentMethod})`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analise o seguinte relatório de serviços prestados e dê insights financeiros estratégicos, identifique tendências e sugira melhorias:\n\n${summary}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  
  // Access .text property directly (not as a method).
  return response.text || "Não foi possível gerar análise.";
};

export const chatWithGemini = async (message: string, history: { role: string, text: string }[]) => {
  // Fix: Create fresh instance and properly map conversation history to the expected format.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })),
    config: {
      systemInstruction: 'Você é um consultor financeiro especialista em pequenos negócios e prestadores de serviço. Ajude o usuário com dúvidas sobre gestão, impostos, precificação e crescimento.'
    }
  });

  // chat.sendMessage only accepts the message parameter as per guidelines.
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const generateMarketingImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        { text: `Crie uma imagem profissional de marketing para um negócio de prestação de serviços: ${prompt}` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      }
    }
  });

  // Find the image part by iterating through all parts as recommended in guidelines.
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("Falha ao gerar imagem.");
};

export const analyzeReceipt = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Extraia as informações principais deste recibo ou fatura (Valor, Data, Itens, Emissor) e resuma em português." }
      ]
    }
  });
  return response.text || "Análise de imagem falhou.";
};
