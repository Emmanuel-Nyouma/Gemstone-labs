import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SmartG Automation",
  description:
    "How SmartG Automation collects, uses, protects, and respects personal information.",
};

const sections = [
  ["01", "Who we are"],
  ["02", "Information we collect"],
  ["03", "How we use information"],
  ["04", "Chatbots and AI-assisted services"],
  ["05", "How we share information"],
  ["06", "Cookies and analytics"],
  ["07", "International data transfers"],
  ["08", "How long we keep information"],
  ["09", "Your privacy rights"],
  ["10", "Security"],
  ["11", "Children’s privacy"],
  ["12", "Changes and contact"],
];

export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <a className="brand" href="/" aria-label="SmartG Automation home">
          <span className="brand-mark">✦</span> SMARTG AUTOMATION
        </a>
        <a className="legal-back" href="/">Back to website <span>↗</span></a>
      </nav>

      <header className="legal-hero">
        <p className="eyebrow">Legal · Your data</p>
        <h1>Privacy<br /><i>Policy.</i></h1>
        <div className="legal-summary">
          <p>
            We believe privacy information should be as clear as the products
            we build. This policy explains what SmartG Automation may collect, why
            we use it, and the choices available to you.
          </p>
          <span>Last updated: July 26, 2026</span>
        </div>
      </header>

      <div className="legal-layout">
        <aside className="legal-index">
          <p>On this page</p>
          {sections.map(([number, title]) => (
            <a href={`#privacy-${number}`} key={number}>
              <span>{number}</span>{title}
            </a>
          ))}
        </aside>

        <article className="legal-content">
          <div className="legal-note">
            <strong>The short version</strong>
            <p>
              We use personal information to respond to enquiries, deliver
              projects, operate our website and chatbot, and improve our
              services. We do not sell your personal information.
            </p>
          </div>

          <section id="privacy-01">
            <span className="legal-number">01</span>
            <h2>Who we are</h2>
            <p>
              SmartG Automation (“SmartG Automation,” “we,” “us,” or “our”) provides
              business website design and knowledge-powered chatbot services.
              For questions about this policy or your personal information,
              contact us at{" "}
              <a href="mailto:hello@smartg.agency">hello@smartg.agency</a>.
            </p>
          </section>

          <section id="privacy-02">
            <span className="legal-number">02</span>
            <h2>Information we collect</h2>
            <p>We may collect the following categories of information:</p>
            <ul>
              <li><strong>Contact information:</strong> your name, email address, phone number, company, and job title.</li>
              <li><strong>Enquiry and project information:</strong> messages, consultation notes, project requirements, proposals, feedback, and files you choose to provide.</li>
              <li><strong>Chatbot conversations:</strong> questions submitted to our website assistant and technical information needed to return an answer.</li>
              <li><strong>Website usage information:</strong> IP address, browser and device type, approximate location, referring page, pages viewed, and interaction data.</li>
              <li><strong>Business records:</strong> contracts, invoices, payment status, and communications associated with a client relationship.</li>
            </ul>
            <p>
              Please do not submit passwords, payment-card details, health
              information, government identifiers, or other sensitive personal
              information through our public chatbot.
            </p>
          </section>

          <section id="privacy-03">
            <span className="legal-number">03</span>
            <h2>How we use information</h2>
            <p>We use information when reasonably necessary to:</p>
            <ul>
              <li>respond to questions, consultation requests, and proposals;</li>
              <li>plan, build, support, and improve client websites and chatbots;</li>
              <li>operate, secure, troubleshoot, and understand use of our website;</li>
              <li>manage contracts, invoices, project communications, and legal obligations;</li>
              <li>send requested updates or relevant business communications, with an unsubscribe option where required; and</li>
              <li>prevent fraud, misuse, security incidents, and unlawful activity.</li>
            </ul>
            <p>
              Depending on the context and applicable law, we rely on your
              consent, steps requested before entering a contract, performance
              of a contract, compliance with legal obligations, or our
              legitimate interests in operating and improving our business.
            </p>
          </section>

          <section id="privacy-04">
            <span className="legal-number">04</span>
            <h2>Chatbots and AI-assisted services</h2>
            <p>
              Our website assistant is designed to answer questions about
              SmartG Automation and our services. Its responses are informational
              and may be incomplete. Important project, pricing, legal, or
              business decisions are confirmed by a person.
            </p>
            <p>
              When an AI or language-model provider is used, a prompt and
              relevant supporting information may be sent to that provider to
              produce a response. We select service providers with appropriate
              privacy and security commitments and configure them to limit data
              use where those controls are available. We do not intentionally
              use confidential client material to train public models.
            </p>
            <p>
              For client chatbot projects, the client agreement will identify
              the client’s responsibilities, approved knowledge sources, data
              handling, providers, access controls, and retention arrangements.
            </p>
          </section>

          <section id="privacy-05">
            <span className="legal-number">05</span>
            <h2>How we share information</h2>
            <p>We may share information only where needed with:</p>
            <ul>
              <li>hosting, cloud, email, analytics, security, payment, and customer-management providers;</li>
              <li>AI and automation providers used to deliver an approved service;</li>
              <li>professional advisers such as accountants, insurers, and legal counsel;</li>
              <li>contractors working under confidentiality and data-protection obligations; and</li>
              <li>authorities or other parties when required by law, necessary to protect rights and safety, or involved in a business reorganisation.</li>
            </ul>
            <p>
              We do not sell or rent personal information. We do not share it
              for unrelated third-party advertising.
            </p>
          </section>

          <section id="cookies">
            <span className="legal-number">06</span>
            <h2>Cookies and analytics</h2>
            <p>
              Cookies are small files stored on your device. The website may
              use strictly necessary cookies for security and core
              functionality. If we add non-essential analytics or marketing
              cookies, we will provide appropriate notice and choices before
              using them where required by law.
            </p>
            <p>
              You can block or delete cookies using your browser settings, but
              some website functions may not work as expected. This section
              serves as our current Cookie Policy.
            </p>
          </section>

          <section id="privacy-07">
            <span className="legal-number">07</span>
            <h2>International data transfers</h2>
            <p>
              We serve clients internationally and may use providers operating
              in different countries. Where applicable law requires it, we use
              recognised safeguards for international transfers, such as
              contractual protections, approved transfer mechanisms, or an
              adequacy decision.
            </p>
          </section>

          <section id="privacy-08">
            <span className="legal-number">08</span>
            <h2>How long we keep information</h2>
            <p>
              We retain personal information only for as long as reasonably
              needed for the purpose collected, including:
            </p>
            <ul>
              <li>general enquiries: normally up to 24 months after the last meaningful contact;</li>
              <li>public chatbot logs: normally up to 90 days, unless needed for security or an active enquiry;</li>
              <li>client project records: for the relationship and generally up to five years afterwards; and</li>
              <li>financial and legal records: for the period required by applicable accounting, tax, and legal rules.</li>
            </ul>
            <p>
              We may keep information longer where required for a legal claim,
              dispute, security investigation, or legal obligation.
            </p>
          </section>

          <section id="privacy-09">
            <span className="legal-number">09</span>
            <h2>Your privacy rights</h2>
            <p>
              Depending on where you live, you may have rights to request
              access, correction, deletion, restriction, objection, or a
              portable copy of your information. You may also withdraw consent
              where processing relies on consent and complain to the relevant
              data-protection authority.
            </p>
            <p>
              To make a request, email{" "}
              <a href="mailto:hello@smartg.agency">hello@smartg.agency</a>.
              We may need to verify your identity. We will respond within the
              period required by applicable law.
            </p>
          </section>

          <section id="privacy-10">
            <span className="legal-number">10</span>
            <h2>Security</h2>
            <p>
              We use reasonable administrative, technical, and organisational
              measures designed to protect personal information. No online
              service or method of transmission can guarantee absolute
              security, so please use care when choosing what to send online.
            </p>
          </section>

          <section id="privacy-11">
            <span className="legal-number">11</span>
            <h2>Children’s privacy</h2>
            <p>
              Our website and services are intended for businesses and are not
              directed to children. We do not knowingly collect personal
              information from children through this website. If you believe a
              child has provided information, contact us so we can review and
              delete it where appropriate.
            </p>
          </section>

          <section id="privacy-12">
            <span className="legal-number">12</span>
            <h2>Changes and contact</h2>
            <p>
              We may update this policy as our services, providers, or legal
              obligations change. We will publish the revised version here and
              update the date above. Material changes may also be communicated
              directly where appropriate.
            </p>
            <div className="legal-contact">
              <strong>Privacy questions or requests</strong>
              <a href="mailto:hello@smartg.agency">hello@smartg.agency ↗</a>
            </div>
          </section>
        </article>
      </div>

      <footer className="legal-footer">
        <a className="brand" href="/">
          <span className="brand-mark">✦</span> SMARTG AUTOMATION
        </a>
        <div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></div>
        <span>© 2026 SmartG Automation</span>
      </footer>
    </main>
  );
}
