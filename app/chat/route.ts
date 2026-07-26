import { NextRequest, NextResponse } from "next/server";
import knowledgeBase from "../../chatbot/knowledge_base.json";

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  link: string;
};

const knowledge = knowledgeBase as KnowledgeItem[];
const stopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for",
  "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or",
  "our", "the", "to", "we", "what", "when", "where", "which", "will",
  "with", "you", "your",
]);

function tokens(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]+/g)
    ?.filter((token) => token.length > 1 && !stopWords.has(token)) ?? [];
}

function retrieve(question: string) {
  const query = new Set(tokens(question));
  return knowledge
    .map((item) => {
      const title = new Set(tokens(item.title));
      const keywords = new Set(tokens(item.keywords.join(" ")));
      const content = new Set(tokens(item.content));
      let score = 0;
      query.forEach((token) => {
        if (title.has(token)) score += 5;
        if (keywords.has(token)) score += 4;
        if (content.has(token)) score += 1;
      });
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    question?: string;
    history?: { role: string; text: string }[];
  };
  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }

  const matches = retrieve(question);
  const sources = matches
    .filter(({ score }) => score > 0)
    .map(({ item }) => ({ title: item.title, link: item.link }));
  const context = matches
    .map(({ item }, index) => `[Source ${index + 1}: ${item.title}]\n${item.content}`)
    .join("\n\n");

  if (!context || matches[0]?.score === 0) {
    return NextResponse.json({
      answer:
        "I do not have enough approved information to answer that confidently. Ask me about Gemstone Labs, chatbots, websites, pricing, languages, privacy, or support.",
      sources: [],
      confidence: "low",
      mode: "grounded-retrieval",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      answer: matches[0].item.content,
      sources,
      confidence: matches[0].score >= 5 ? "high" : "medium",
      mode: "grounded-retrieval",
    });
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
  const recentHistory = (body.history ?? [])
    .slice(-6)
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");
  const prompt = `You are the Gemstone Guide, the concise website assistant for Gemstone Labs.
Answer only from the approved context below. Never invent prices, guarantees, clients, or capabilities.
Use plain, non-technical language and match the user's language. Keep the answer under 110 words.
If the context is insufficient, say so and suggest a relevant Gemstone Labs topic or a free consultation.

Recent conversation:
${recentHistory || "None"}

Approved context:
${context}

Customer question: ${question}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
        }),
      },
    );
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const answer = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
    if (!answer) throw new Error("Gemini returned an empty answer");

    return NextResponse.json({
      answer,
      sources,
      confidence: matches[0].score >= 5 ? "high" : "medium",
      mode: "gemini-rag",
    });
  } catch {
    return NextResponse.json({
      answer: matches[0].item.content,
      sources,
      confidence: "medium",
      mode: "grounded-retrieval",
    });
  }
}
