"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const sampleQuestions = [
  "What can you automate for my business?",
  "Can you build a voice AI agent?",
  "How do you prevent wrong answers?",
  "Can it work in French and English?",
  "How is pricing decided?",
];

const tools = ["WhatsApp", "Gmail", "Google Sheets", "HubSpot", "Calendly", "Slack", "Notion", "n8n"];

const useCases = [
  {
    title: "Answer customer questions 24/7",
    text: "A chatbot on your website or WhatsApp that answers from your own documents, in your brand voice.",
    flow: [
      ["When", "A customer asks about prices, hours or services"],
      ["AI", "Finds the answer in your approved knowledge"],
      ["Then", "Replies instantly, or hands off to your team when unsure"],
    ],
    href: "/ai-chatbots",
  },
  {
    title: "Capture and follow up every lead",
    text: "Stop losing enquiries that arrive after hours or sit unanswered in an inbox.",
    flow: [
      ["When", "Someone fills a form, sends a DM or chats"],
      ["AI", "Asks the right questions and qualifies the lead"],
      ["Then", "Adds it to your CRM, books a call and sends the follow-up"],
    ],
    href: "/ai-chatbots",
  },
  {
    title: "A voice receptionist that never misses a call",
    text: "Callers speak naturally with an agent that answers, takes details and routes urgent calls.",
    flow: [
      ["When", "A customer calls your business line"],
      ["AI", "Answers common questions and collects their details"],
      ["Then", "Books the appointment and sends your team a summary"],
    ],
    href: "/voice-ai-agents",
  },
  {
    title: "Take repetitive admin off your team",
    text: "Workflows that move data between your tools so nobody copies and pastes all day.",
    flow: [
      ["When", "An invoice, order or email arrives"],
      ["AI", "Reads it and extracts the important details"],
      ["Then", "Updates your sheets or CRM and notifies the right person"],
    ],
    href: "#contact",
  },
];

const pipeline = [
  ["Understands the question", "Rewrites short follow-ups using the conversation so far."],
  ["Searches approved knowledge", "Looks only in documents the business has signed off."],
  ["Ranks the evidence", "Multilingual embeddings and reranking pick the best passages."],
  ["Refuses when unsure", "If the evidence is weak, it says so instead of guessing."],
  ["Answers with sources", "Every grounded answer cites where it came from."],
];

const steps = [
  ["Free · 20 minutes", "Discovery call", "We find the one repetitive task that costs you the most time or leads, and whether automation is worth it."],
  ["Weeks 1–3", "Build and test", "We connect your knowledge and tools, then test it against your real customer questions before anything goes live."],
  ["Ongoing", "Launch and improve", "We go live, watch real conversations, and keep improving answers and workflows as your business changes."],
];

// Starting prices shown publicly. Adjust to match current offers.
const packages = [
  {
    name: "Starter chatbot",
    price: "$900",
    unit: "one-off",
    text: "One AI assistant trained on your business, live on your website.",
    items: ["Up to 50 pages of approved knowledge", "Website chat widget", "Lead capture to email or Sheets", "English and French"],
    featured: false,
  },
  {
    name: "Automation build",
    price: "$1,800",
    unit: "one-off",
    text: "A chatbot or voice agent plus the workflows that act on what it learns.",
    items: ["Everything in Starter", "WhatsApp or voice channel", "CRM, calendar and email integrations", "Human handoff rules"],
    featured: true,
  },
  {
    name: "Care plan",
    price: "$150",
    unit: "/ month",
    text: "Keep your assistant accurate as your prices, services and policies change.",
    items: ["Monthly knowledge updates", "Conversation review and fixes", "Usage report", "Priority support"],
    featured: false,
  },
];

const faqs = [
  ["What if the AI gives a wrong answer?", "It only answers from knowledge you approve, and it is built to say \"I'm not sure\" and hand off to a person when the evidence is weak. We test it against your real questions before launch."],
  ["Is my business data safe?", "Your documents are used only for your assistant. Provider keys stay on the server side and are never exposed in the browser, and we only connect the tools you agree to."],
  ["Does it work in French and English?", "Yes. Assistants can understand and reply in both, and we test each language separately before launch."],
  ["How long does a project take?", "Most chatbots go live in 1–3 weeks. Voice agents and multi-tool automations usually take 3–5 weeks, depending on integrations."],
  ["Will I have running costs?", "AI and hosting usage is billed by the providers and is usually small for a growing business. We estimate it with you before building."],
  ["Do I need a new website?", "No. The assistant plugs into the site you already have. If you need a new one, we build conversion-focused business websites too."],
];

// Add your real profile URLs here; only listed profiles are shown.
const socials: Array<[name: string, href: string]> = [];

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
};

const N8N_CHAT_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ??
  "https://nj4561.app.n8n.cloud/webhook/bded34de-5897-4fac-943c-b0f884a65591/chat";
const NEWSLETTER_API_URL = process.env.NEXT_PUBLIC_NEWSLETTER_API_URL ?? "";
const CONTACT_EMAIL = "hello@smartg.agency";
const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  `mailto:${CONTACT_EMAIL}?subject=Free%20discovery%20call`;
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

function newsletterEndpoint() {
  return NEWSLETTER_API_URL
    ? `${NEWSLETTER_API_URL}/newsletter`
    : "/api/newsletter";
}

function BookingLink({ className, children }: { className: string; children: React.ReactNode }) {
  const external = BOOKING_URL.startsWith("http");
  return (
    <a
      className={className}
      href={BOOKING_URL}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hi, I'm the SmartG Guide. Ask me what we can automate, how it works, or what it costs.",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Scroll only the chat panel so the page does not jump while reading.
    const panel = chatMessagesRef.current;
    if (panel) panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function askQuestion(value: string) {
    const cleanQuestion = value.trim();
    if (!cleanQuestion || thinking) return;

    setQuestion("");
    setMessages((current) => [
      ...current,
      { sender: "user", text: cleanQuestion },
    ]);
    setThinking(true);

    let answer =
      "The live demo is offline right now. Book a free call and we'll walk you through it, or try again in a moment.";

    try {
      chatSessionIdRef.current ??= crypto.randomUUID();
      const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: cleanQuestion,
          sessionId: chatSessionIdRef.current,
        }),
      });
      if (!response.ok) throw new Error("n8n chat request failed");
      const data = (await response.json()) as { output?: string };
      if (!data.output) throw new Error("n8n chat response missing output");
      answer = data.output;
    } catch {
      // Do not fabricate a response when the grounded workflow is unavailable.
    }

    setMessages((current) => [...current, { sender: "bot", text: answer }]);
    setThinking(false);
  }

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    void askQuestion(question);
  }

  async function subscribe(event: FormEvent) {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus("loading");
    try {
      const response = await fetch(newsletterEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = (await response.json()) as { status?: string };
      setNewsletterStatus(
        response.ok && data.status === "subscribed" ? "success" : "error",
      );
    } catch {
      setNewsletterStatus("error");
    }
  }

  return (
    <main className="home">
      <nav className="nav">
        <a className="brand" href="#top" aria-label="SmartG Automation home">
          <span className="brand-mark">✦</span> SMARTG AUTOMATION
        </a>
        <div className="nav-links">
          <a href="#use-cases">What we automate</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <BookingLink className="nav-cta button primary">
          Book a free call <span>↗</span>
        </BookingLink>
      </nav>

      <section id="top" className="home-hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">AI automation for growing businesses</p>
            <h1>
              Automate the questions, follow-ups and admin that{" "}
              <i>slow your team down.</i>
            </h1>
            <p className="hero-sub">
              We build AI chatbots, voice agents and workflows that answer
              customers from your own knowledge, capture every lead, and plug
              into the tools you already use.
            </p>
            <div className="hero-actions">
              <BookingLink className="button primary">
                Book a free 20-min call <span>↗</span>
              </BookingLink>
              <a className="button text-button" href="#pricing">
                See packages
              </a>
            </div>
            <ul className="hero-facts">
              <li>Live in 1–3 weeks</li>
              <li>English and French</li>
              <li>A person steps in when needed</li>
            </ul>
          </div>

          <div id="demo" className="demo">
            <div className="demo-label">
              <span>Live demo: ask it anything</span>
            </div>
            <div className="chat-card">
              <div className="chat-head">
                <div className="bot-avatar">✦</div>
                <div>
                  <strong>SmartG Guide</strong>
                  <span>Answers only from approved knowledge</span>
                </div>
                <small className="rag-badge">GRAPH RAG</small>
              </div>
              <div className="chat-messages" aria-live="polite" ref={chatMessagesRef}>
                {messages.map((message, index) => (
                  <div className={`message ${message.sender}`} key={`${message.text}-${index}`}>
                    <p>{message.text}</p>
                  </div>
                ))}
                {thinking && <div className="message bot thinking" aria-label="Thinking"><b /><b /><b /></div>}
              </div>
              <div className="sample-questions" aria-label="Sample questions">
                {sampleQuestions.map((item) => (
                  <button type="button" onClick={() => void askQuestion(item)} key={item}>
                    {item}
                  </button>
                ))}
              </div>
              <form className="chat-input" onSubmit={submitQuestion}>
                <input
                  aria-label="Ask SmartG Automation a question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask a question..."
                />
                <button type="submit" aria-label="Send question" disabled={thinking}>↑</button>
              </form>
            </div>
            <p className="chat-disclaimer">
              This is the same grounded setup we build for clients.
            </p>
          </div>
        </div>
      </section>

      <section className="tools" aria-label="Tools we connect">
        <div className="wrap">
          <p>Connects with</p>
          <ul>
            {tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </div>
      </section>

      <section id="use-cases" className="section">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">What we automate</p>
            <h2>Start with the work your team <i>repeats every day.</i></h2>
            <p>
              Each automation follows the same pattern: something happens, AI
              handles the thinking, and your tools take the next step.
            </p>
          </div>
          <div className="use-case-grid">
            {useCases.map((useCase) => (
              <article className="use-case reveal" key={useCase.title}>
                <h3>{useCase.title}</h3>
                <p>{useCase.text}</p>
                <ol className="flow">
                  {useCase.flow.map(([label, text]) => (
                    <li key={label}><b>{label}</b>{text}</li>
                  ))}
                </ol>
                <a href={useCase.href}>
                  {useCase.href === "#contact" ? "Tell us your workflow" : "Learn more"} →
                </a>
              </article>
            ))}
          </div>
          <p className="also">
            Need a site to put it on? We also build{" "}
            <a href="/business-websites">conversion-focused business websites</a>.
          </p>
        </div>
      </section>

      <section className="section proof">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Built to be trusted</p>
            <h2>Why our assistants <i>don&apos;t make things up.</i></h2>
            <p>
              The demo above runs on the same pipeline we deploy for clients.
              Here is what happens behind every answer.
            </p>
          </div>
          <ol className="pipeline reveal">
            {pipeline.map(([title, text]) => (
              <li key={title}><h3>{title}</h3><p>{text}</p></li>
            ))}
          </ol>
          <div className="proof-cta">
            <a className="button lime" href="#demo">Test it yourself <span>↑</span></a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">How it works</p>
            <h2>From first call to <i>live in weeks.</i></h2>
          </div>
          <ol className="steps reveal">
            {steps.map(([when, title, text]) => (
              <li key={title}><small>{when}</small><h3>{title}</h3><p>{text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="pricing" className="section pricing">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Pricing</p>
            <h2>Clear starting prices. <i>No surprise bundles.</i></h2>
            <p>
              Every project gets a fixed quote after the free call, based on the
              channels, languages and integrations you actually need.
            </p>
          </div>
          <div className="price-grid">
            {packages.map((item) => (
              <article className={`price-card reveal${item.featured ? " featured" : ""}`} key={item.name}>
                <h3>{item.name}</h3>
                <p className="price"><small>from</small>{item.price}<small className="unit">{item.unit}</small></p>
                <p>{item.text}</p>
                <ul>
                  {item.items.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <BookingLink className={`button ${item.featured ? "lime" : "primary"}`}>
                  Get a quote <span>↗</span>
                </BookingLink>
              </article>
            ))}
          </div>
          <p className="price-note">AI and hosting usage is billed separately at cost, and we estimate it with you up front.</p>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="wrap faq-layout">
          <div className="section-head reveal">
            <p className="eyebrow">FAQ</p>
            <h2>Questions people <i>ask us first.</i></h2>
            <p>Or ask the live demo at the top of the page.</p>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="final-cta">
        <div className="wrap reveal">
          <p className="eyebrow">Start with one conversation</p>
          <h2>What does your team answer <i>every single day?</i></h2>
          <p>
            Tell us in a free 20-minute call. We&apos;ll show you the simplest
            automation worth building first, or tell you honestly if it isn&apos;t worth it.
          </p>
          <div className="hero-actions">
            <BookingLink className="button primary">
              Book a free call <span>↗</span>
            </BookingLink>
            {WHATSAPP_NUMBER ? (
              <a className="button text-button" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
                Message us on WhatsApp
              </a>
            ) : (
              <a className="button text-button" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <a className="brand" href="#top"><span className="brand-mark">✦</span> SMARTG AUTOMATION</a>
              <p>AI chatbots, voice agents and workflow automation for growing businesses.</p>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
            <div className="footer-column">
              <h3>Services</h3>
              <a href="/ai-chatbots">AI chatbots</a>
              <a href="/voice-ai-agents">Voice AI agents</a>
              <a href="/business-websites">Business websites</a>
              <a href="/process">Our process</a>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <a href="#demo">Live demo</a>
              <a href="#contact">Contact</a>
            </div>
            <div id="newsletter">
              {newsletterStatus === "success" ? (
                <p className="newsletter-success" role="status">✦ You&apos;re on the list. Watch your inbox.</p>
              ) : (
                <form className="newsletter-form" onSubmit={subscribe}>
                  <label htmlFor="newsletter-email">The SmartG Brief</label>
                  <p>Practical automation ideas for growing businesses. No noise.</p>
                  <div>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(event) => setNewsletterEmail(event.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                    <button type="submit" disabled={newsletterStatus === "loading"}>
                      {newsletterStatus === "loading" ? "Joining..." : "Subscribe"}
                    </button>
                  </div>
                  <small>No spam. Unsubscribe anytime. <a href="/privacy">Privacy Policy</a>.</small>
                  {newsletterStatus === "error" && (
                    <p className="newsletter-error" role="alert">Please try again.</p>
                  )}
                </form>
              )}
            </div>
          </div>

          {socials.length > 0 && (
            <div className="socials" aria-label="SmartG Automation social media">
              {socials.map(([name, href]) => (
                <a href={href} target="_blank" rel="noreferrer" key={name}>{name}</a>
              ))}
            </div>
          )}

          <div className="footer-bottom">
            <span>© 2026 SmartG Automation. All rights reserved.</span>
            <div>
              <a href="/privacy">Privacy policy</a>
              <a href="/terms">Terms of service</a>
              <a href="/privacy#cookies">Cookie policy</a>
            </div>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}
