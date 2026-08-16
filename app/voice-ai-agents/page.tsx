import type { Metadata } from "next";
import { SeoPage } from "../seo-page";

export const metadata: Metadata = {
  title: "Voice AI Agents for Businesses",
  description:
    "Gemstone Labs designs voice AI agents for natural customer conversations, enquiry qualification, and thoughtful human handoff.",
  alternates: { canonical: "/voice-ai-agents" },
};

export default function VoiceAiAgentsPage() {
  return (
    <SeoPage
      eyebrow="Voice AI agents"
      title="Make it easier for customers to get help by simply speaking."
      intro="Gemstone Labs designs carefully scoped voice experiences that help customers ask questions naturally, reach the right next step, and connect with a person when the moment needs human judgement."
      sections={[
        {
          title: "Natural conversations",
          body: "A voice agent can make your approved business information easier to reach for people who would rather speak than search through pages or menus.",
        },
        {
          title: "Answer, qualify, and route",
          body: "It can handle common questions, understand the reason for an enquiry, collect the useful context, and guide the conversation toward the right service or team.",
        },
        {
          title: "Human handoff by design",
          body: "Uncertain, sensitive, or high-impact requests should not be guessed at. We define clear boundaries so the agent can hand the conversation to a person when appropriate.",
        },
        {
          title: "A scope that fits your business",
          body: "The voice channel, languages, integrations, approved knowledge, and support plan are shaped around your customers and confirmed in the project proposal.",
        },
      ]}
    />
  );
}
