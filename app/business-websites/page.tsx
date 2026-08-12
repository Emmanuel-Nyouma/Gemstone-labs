import type { Metadata } from "next";
import { SeoPage } from "../seo-page";

export const metadata: Metadata = {
  title: "Business Websites That Convert",
  description: "Gemstone Labs designs modern business websites with clear positioning, persuasive pages, and a faster path to enquiry.",
  alternates: { canonical: "/business-websites" },
};

export default function BusinessWebsitesPage() {
  return <SeoPage eyebrow="Business websites" title="Make your website easier to understand and easier to act on." intro="Gemstone Labs designs modern business websites that make your offer clear, build confidence, and move visitors toward a useful next step." sections={[
    { title: "Clear positioning", body: "Your first screen should make it obvious who you help, what you solve, and why a visitor should continue. We turn scattered ideas into a focused message." },
    { title: "Pages built around decisions", body: "Service pages, proof, FAQs, and calls to action are arranged around the questions visitors need answered before they enquire." },
    { title: "Fast and responsive by default", body: "The experience is designed to work clearly across phones, tablets, and desktops, with a direct path from interest to contact." },
    { title: "Add an assistant when useful", body: "A website can stand on its own or work alongside a knowledge-powered chatbot that helps visitors find the right answer and next step." },
  ]} />;
}
