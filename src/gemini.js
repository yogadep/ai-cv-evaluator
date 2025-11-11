import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-pro";
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || "text-embedding-004";

// Generate a chat response (one-shot)
export async function chatOnce(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini Chat Error:", err?.message || err);
    throw new Error("Failed to generate chat response");
  }
}

// Generate embeddings for RAG (Weaviate, vector search)
export async function embedText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: EMBED_MODEL });
    
    // Correct method for embedding
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT"
    });
    
    return result.embedding.values;
  } catch (err) {
    console.error("Gemini Embedding Error:", err?.message || err);
    throw new Error("Failed to generate embeddings");
  }
}