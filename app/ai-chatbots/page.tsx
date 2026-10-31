import type { Metadata } from "next";
import { SeoPage } from "../seo-page";

export const metadata: Metadata = {
  title: "RAG Chatbots for Businesses",
  description: "SmartG Automation builds grounded AI chatbots that answer customer questions from your approved business knowledge.",
  alternates: { canonical: "/ai-chatbots" },
};

export default function AiChatbotsPage() {
  return <SeoPage eyebrow="Knowledge-powered AI chatbots" title="Give customers a useful answer before they leave." intro="SmartG Automation builds customer-facing chatbots that use the information your business approves, so visitors can find clarity without waiting for your team." sections={[
    { title: "Answers grounded in your business", body: "The assistant can work from your service pages, policies, guides, product information, and frequently asked questions. It is designed around your business instead of acting like a generic chatbot." },
    { title: "More than an FAQ box", body: "A focused assistant can guide visitors to the right service, capture useful enquiries, reduce repetitive support questions, and direct uncertain requests to a person." },
    { title: "Built for responsible conversations", body: "We define approved topics, test difficult questions, add clear uncertainty responses, and keep high-impact decisions with qualified people." },
    { title: "A practical starting point", body: "We begin with the questions your team answers most often and the information customers need before they contact you. Then we recommend the simplest useful scope." },
  ]} />;
}
