import type { Metadata } from "next";
import { SeoPage } from "../seo-page";

export const metadata: Metadata = {
  title: "Our AI Chatbot and Website Process",
  description: "See how Gemstone Labs moves from discovery to a tested, useful AI chatbot or business website.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return <SeoPage eyebrow="How we work" title="A focused process from repeated question to useful experience." intro="Good digital experiences start with the customer question, not the technology. We keep the process clear, collaborative, and grounded in what your business actually needs." sections={[
    { title: "01 — Discover", body: "We learn about your business, customers, repeated questions, current website, and desired outcome." },
    { title: "02 — Prepare", body: "We organise the information, clarify the message, and define the experience and boundaries before building." },
    { title: "03 — Build and test", body: "We create the website or assistant, then test realistic questions, edge cases, handoffs, and calls to action." },
    { title: "04 — Launch and improve", body: "After launch, we review real usage, update approved information, and improve the experience as your business changes." },
  ]} />;
}
