"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const heroPhrases = [
  "answers customers instantly.",
  "turns questions into leads.",
  "works while your team sleeps.",
  "speaks with your brand voice.",
  "knows when to involve a person.",
];

const sampleQuestions = [
  "How could a chatbot help my business?",
  "Can you build a voice AI agent?",
  "How do you prevent wrong answers?",
  "Can it work in French and English?",
  "How is pricing decided?",
];

const socials = [
  ["TikTok", "https://www.tiktok.com", "tiktok"],
  ["Instagram", "https://www.instagram.com", "instagram"],
  ["WhatsApp", "https://www.whatsapp.com", "whatsapp"],
  ["LinkedIn", "https://www.linkedin.com", "linkedin"],
  ["Facebook", "https://www.facebook.com", "facebook"],
  ["X", "https://x.com", "x"],
  ["GitHub", "https://github.com", "github"],
  ["Threads", "https://www.threads.net", "threads"],
  ["Hugging Face", "https://huggingface.co", "huggingface"],
  ["YouTube", "https://www.youtube.com", "youtube"],
];

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
};

const N8N_CHAT_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL ??
  "https://nj4561.app.n8n.cloud/webhook/bded34de-5897-4fac-943c-b0f884a65591/chat";
const NEWSLETTER_API_URL = process.env.NEXT_PUBLIC_NEWSLETTER_API_URL ?? "";

function newsletterEndpoint() {
  return NEWSLETTER_API_URL
    ? `${NEWSLETTER_API_URL}/newsletter`
    : "/api/newsletter";
}

function useTypedPhrase() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = heroPhrases[index];
    const complete = text === phrase;
    const empty = text.length === 0;
    const delay = complete && !deleting ? 1600 : deleting ? 32 : 54;
    const timer = window.setTimeout(() => {
      if (complete && !deleting) return setDeleting(true);
      if (empty && deleting) {
        setDeleting(false);
        setIndex((current) => (current + 1) % heroPhrases.length);
        return;
      }
      setText(
        deleting
          ? phrase.slice(0, Math.max(0, text.length - 1))
          : phrase.slice(0, text.length + 1),
      );
    }, delay);
    return () => window.clearTimeout(timer);
  }, [deleting, index, text]);

  return text;
}

export default function Home() {
  const typedPhrase = useTypedPhrase();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hi—I'm the Gemstone Guide. Ask me about chatbots, websites, pricing, or our process.",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const chatEndRef = useRef<HTMLDivElement>(null);
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
    document
      .querySelectorAll(".reveal, .reveal-stagger")
      .forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      "The live assistant is temporarily unavailable. Please try again in a moment.";

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
    <main>
      <nav className="nav">
        <a className="brand" href="#top" aria-label="Gemstone Labs home">
          <span className="brand-mark">✦</span> GEMSTONE LABS
        </a>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#assistant">Live demo</a>
          <a href="#process">Process</a>
          <a href="#pricing">Pricing</a>
        </div>
        <a className="nav-cta" href="#contact">
          Book a free call <span>↗</span>
        </a>
      </nav>

      <section id="top" className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-content reveal reveal-left">
          <p className="eyebrow">AI that makes your business more helpful</p>
          <h1>
            Turn your business knowledge into an assistant that{" "}
            <i className="typed-line">
              {typedPhrase}<span className="cursor">|</span>
            </i>
          </h1>
          <p className="hero-copy">
            We build intelligent chatbots that answer customers using your
            trusted information—and websites that turn attention into action.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#contact">
              Book a free consultation <span>↗</span>
            </a>
            <a className="button text-button" href="#assistant">
              Try the live assistant <span>↓</span>
            </a>
          </div>
          <div className="trust-line reveal-stagger">
            <span><b>01</b> Available day and night</span>
            <span><b>02</b> Answers from approved knowledge</span>
            <span><b>03</b> Hands complex requests to people</span>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div>
          RAG CHATBOTS <b>✦</b> VOICE AI AGENTS <b>✦</b> BUSINESS WEBSITES
          <b>✦</b> CUSTOMER SUPPORT <b>✦</b> LEAD GENERATION <b>✦</b> RAG
          CHATBOTS <b>✦</b> VOICE AI AGENTS <b>✦</b> BUSINESS WEBSITES <b>✦</b>
        </div>
      </div>

      <section id="services" className="services section">
        <div className="reveal reveal-left">
          <p className="eyebrow">What we build</p>
          <h2>Fewer repeated questions.<br /><i>More useful conversations.</i></h2>
          <p className="intro-copy">
            We start with the business problem, then create the simplest digital
            experience that solves it.
          </p>
        </div>
        <div className="service-list reveal-stagger">
          <article className="service">
            <span>01</span>
            <div>
              <h3>Knowledge-powered chatbots</h3>
              <p>
                Give customers reliable answers, guide them to the right
                service, and capture enquiries without making them wait.
              </p>
              <small>Our primary service</small>
            </div>
            <b>↗</b>
          </article>
          <article className="service">
            <span>02</span>
            <div>
              <h3>Business websites</h3>
              <p>
                A clear, modern website that explains your value and makes the
                next step obvious on every screen.
              </p>
              <small>Designed to convert</small>
            </div>
            <b>↗</b>
          </article>
          <article className="service">
            <span>03</span>
            <div>
              <h3>Voice AI agents</h3>
              <p>
                Let customers speak naturally with an agent that answers,
                qualifies enquiries, and knows when a person should take over.
              </p>
              <small>Natural conversations, carefully scoped</small>
            </div>
            <b>↗</b>
          </article>
        </div>
      </section>

      <section className="why section">
        <div className="why-heading reveal reveal-left">
          <p className="eyebrow">Why it matters</p>
          <h2>Your customers want<br /><i>clarity, not complexity.</i></h2>
          <p>
            Every unanswered question can become a lost opportunity. Make help
            immediate, consistent, and easy to find.
          </p>
        </div>
        <div className="benefit-grid reveal-stagger">
          {[
            ["01", "Always available", "Help customers after hours, on weekends, and during busy periods."],
            ["02", "Consistent answers", "Share the same approved information across every conversation."],
            ["03", "Better enquiries", "Guide visitors before they reach your sales or support team."],
            ["04", "Less repetition", "Give your team more time for work that needs a human."],
          ].map(([number, title, text]) => (
            <article className="benefit" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="results section">
        <div className="feature-card reveal reveal-scale">
          <div className="feature-grid" />
          <div className="feature-content">
            <p>BUILT AROUND YOUR BUSINESS</p>
            <h2>Your knowledge.<br /><i>One useful answer.</i></h2>
            <span>
              We organise the information you already trust into an assistant
              customers can use naturally.
            </span>
          </div>
          <div className="feature-stats reveal-stagger">
            <div><strong>24/7</strong><small>customer access</small></div>
            <div><strong>1</strong><small>approved knowledge source</small></div>
            <div><strong>∞</strong><small>questions supported</small></div>
          </div>
        </div>
      </section>

      <section id="assistant" className="assistant-section section">
        <div className="assistant-copy reveal reveal-left">
          <p className="eyebrow">Don&apos;t take our word for it</p>
          <h2>Ask the<br /><i>demo.</i></h2>
          <p>
            This assistant searches approved Gemstone Labs knowledge before it
            answers—and shows you its sources.
          </p>
          <div className="sample-questions">
            <span>Try one:</span>
            {sampleQuestions.map((item) => (
              <button type="button" onClick={() => void askQuestion(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-card reveal reveal-right">
          <div className="chat-head">
            <div className="bot-avatar">✦</div>
            <div>
              <strong>Gemstone Guide</strong>
              <span><i /> Grounded in approved knowledge</span>
            </div>
            <small className="rag-badge">GRAPH RAG</small>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`message ${message.sender}`} key={`${message.text}-${index}`}>
                <p>{message.text}</p>
              </div>
            ))}
            {thinking && <div className="message bot thinking"><b /><b /><b /></div>}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input" onSubmit={submitQuestion}>
            <input
              aria-label="Ask Gemstone Labs a question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question..."
            />
            <button type="submit" aria-label="Send question">↑</button>
          </form>
          <p className="chat-disclaimer">
            Grounded AI demo. Important decisions are confirmed by a person.
          </p>
        </div>
      </section>

      <section id="process" className="process section">
        <div className="process-head reveal reveal-left">
          <p className="eyebrow">How we work</p>
          <h2>From repeated question<br /><i>to useful answer.</i></h2>
        </div>
        <div className="process-grid reveal-stagger">
          {[
            ["01", "Discover", "We identify the questions, friction, and outcome that matter most."],
            ["02", "Prepare", "We organise the business information your assistant can trust."],
            ["03", "Build", "We design, connect, and test the complete customer experience."],
            ["04", "Improve", "We launch, learn from real usage, and keep it useful."],
          ].map(([number, title, text]) => (
            <article className="process-step" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonials section">
        <div className="testimonial-head reveal reveal-left">
          <div>
            <p className="eyebrow">Early client stories</p>
            <h2>What better service<br /><i>can feel like.</i></h2>
          </div>
          <p className="placeholder-note">
            Representative scenarios for now. Verified client stories will
            replace them as Gemstone Labs projects launch.
          </p>
        </div>
        <div className="testimonial-grid reveal-stagger">
          {[
            ["“", "Our customers finally get useful answers before they ever need to call us.", "Amina N.", "Operations lead · Sample scenario"],
            ["“", "The website makes our offer clear, and the assistant handles the questions that slowed sales down.", "David M.", "Founder · Sample scenario"],
            ["“", "Our team spends less time repeating information and more time solving important cases.", "Sarah K.", "Customer service · Sample scenario"],
          ].map(([mark, quote, name, role]) => (
            <figure className="testimonial" key={name}>
              <span className="quote-mark">{mark}</span>
              <blockquote>{quote}</blockquote>
              <figcaption><strong>{name}</strong><span>{role}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="pricing" className="pricing section">
        <div className="pricing-card reveal reveal-scale">
          <div>
            <p className="eyebrow">Flexible pricing</p>
            <h2>A focused solution.<br /><i>A tailored quote.</i></h2>
          </div>
          <div className="pricing-copy">
            <p>
              Your investment depends on the knowledge, languages, integrations,
              pages, and support your project actually needs.
            </p>
            <ul>
              <li>Clear scope before work begins</li>
              <li>Options for a phased launch</li>
              <li>No unnecessary feature bundle</li>
            </ul>
            <a className="button primary" href="#contact">
              Request a tailored quote <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section id="newsletter" className="newsletter">
        <div className="newsletter-orb" />
        <div className="newsletter-copy reveal reveal-left">
          <p className="eyebrow">The Gemstone Brief</p>
          <h2>Useful AI ideas.<br /><i>No noise.</i></h2>
          <p>
            Practical chatbot lessons and website ideas for growing businesses.
          </p>
        </div>
        <div className="newsletter-form-wrap reveal reveal-right">
          {newsletterStatus === "success" ? (
            <div className="newsletter-success" role="status">
              <span>✦</span>
              <div><strong>You&apos;re on the list.</strong><p>Watch your inbox.</p></div>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={subscribe}>
              <label htmlFor="newsletter-email">Subscribe to our newsletter</label>
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
                  {newsletterStatus === "loading" ? "Joining..." : "Subscribe"} <span>↗</span>
                </button>
              </div>
              <small>No spam. Unsubscribe anytime. <a href="/privacy">Privacy Policy</a>.</small>
              {newsletterStatus === "error" && (
                <p className="newsletter-error" role="alert">Please try again.</p>
              )}
            </form>
          )}
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="contact-glow" />
        <div className="reveal reveal-scale">
          <p className="eyebrow">Start with one conversation</p>
          <h2>What question does your team<br /><i>answer every day?</i></h2>
          <p className="contact-copy">
            Tell us. We&apos;ll show you the simplest valuable place to begin.
          </p>
          <div className="contact-actions">
            <a className="contact-link" href="mailto:hello@gemstonelabs.ai">
              hello@gemstonelabs.ai <span>↗</span>
            </a>
            <a className="button dark-outline" href="https://wa.me/" target="_blank" rel="noreferrer">
              Talk on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#top"><span className="brand-mark">✦</span> GEMSTONE LABS</a>
            <p>Helpful chatbots and clear websites for growing businesses.</p>
            <a className="footer-email" href="mailto:hello@gemstonelabs.ai">
              hello@gemstonelabs.ai
            </a>
          </div>
          <div className="footer-column">
            <h3>Explore</h3>
            <a href="#services">Services</a><a href="#assistant">Live demo</a>
            <a href="#process">Process</a><a href="#pricing">Pricing</a>
          </div>
          <div className="footer-column">
            <h3>Services</h3>
            <a href="/ai-chatbots">RAG chatbots</a><a href="/voice-ai-agents">Voice AI agents</a>
            <a href="/business-websites">Business websites</a>
            <a href="#contact">Support</a>
          </div>
          <div className="footer-column">
            <h3>Connect</h3>
            <a href="#contact">Free consultation</a><a href="#newsletter">Newsletter</a>
            <span>Serving clients worldwide</span>
          </div>
        </div>

        <div className="socials" aria-label="Gemstone Labs social media">
          {socials.map(([name, href, slug]) => (
            <a href={href} target="_blank" rel="noreferrer" aria-label={name} key={name}>
              <img
                src={
                  slug === "linkedin"
                    ? "/linkedin.svg"
                    : `https://cdn.simpleicons.org/${slug}/c8f235`
                }
                alt=""
              />
              <span>{name}</span>
            </a>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© 2026 Gemstone Labs. All rights reserved.</span>
          <div>
            <a href="/privacy">Privacy policy</a>
            <a href="/terms">Terms of service</a>
            <a href="/privacy#cookies">Cookie policy</a>
          </div>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
