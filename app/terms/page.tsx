import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Gemstone Labs",
  description:
    "Terms governing use of the Gemstone Labs website and agency services.",
};

const sections = [
  ["01", "Acceptance of these terms"],
  ["02", "Our services"],
  ["03", "Proposals and client agreements"],
  ["04", "Your responsibilities"],
  ["05", "Fees and payment"],
  ["06", "Intellectual property"],
  ["07", "AI and chatbot limitations"],
  ["08", "Third-party services"],
  ["09", "Confidentiality"],
  ["10", "Acceptable use"],
  ["11", "Warranties and liability"],
  ["12", "Ending services"],
  ["13", "Disputes and general terms"],
  ["14", "Changes and contact"],
];

export default function TermsOfService() {
  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <a className="brand" href="/" aria-label="Gemstone Labs home">
          <span className="brand-mark">✦</span> GEMSTONE LABS
        </a>
        <a className="legal-back" href="/">Back to website <span>↗</span></a>
      </nav>

      <header className="legal-hero terms-hero">
        <p className="eyebrow">Legal · Working together</p>
        <h1>Terms of<br /><i>Service.</i></h1>
        <div className="legal-summary">
          <p>
            These terms explain the rules for using our website and the
            foundation of working with Gemstone Labs. Every paid project will
            also have a proposal or service agreement with its specific scope.
          </p>
          <span>Last updated: July 26, 2026</span>
        </div>
      </header>

      <div className="legal-layout">
        <aside className="legal-index">
          <p>On this page</p>
          {sections.map(([number, title]) => (
            <a href={`#terms-${number}`} key={number}>
              <span>{number}</span>{title}
            </a>
          ))}
        </aside>

        <article className="legal-content">
          <div className="legal-note">
            <strong>The short version</strong>
            <p>
              Use our website lawfully, do not rely on chatbot answers as
              professional advice, and make sure project expectations are
              recorded in a signed proposal. We commit to clear communication
              and professional delivery.
            </p>
          </div>

          <section id="terms-01">
            <span className="legal-number">01</span>
            <h2>Acceptance of these terms</h2>
            <p>
              These Terms of Service (“Terms”) apply when you access the
              Gemstone Labs website, use its chatbot, contact us, or purchase a
              service. By using the website, you agree to these Terms. If you
              do not agree, please do not use the website.
            </p>
            <p>
              If you use the website on behalf of a company or organisation,
              you confirm that you have authority to act for it.
            </p>
          </section>

          <section id="terms-02">
            <span className="legal-number">02</span>
            <h2>Our services</h2>
            <p>
              Gemstone Labs provides website strategy, messaging, design,
              development, knowledge-powered chatbots, automation, support,
              maintenance, and related advisory services. Website descriptions
              are general and do not guarantee that every feature is included
              in every project.
            </p>
          </section>

          <section id="terms-03">
            <span className="legal-number">03</span>
            <h2>Proposals and client agreements</h2>
            <p>
              A paid project begins only after the parties accept a written
              proposal, statement of work, or service agreement. That document
              may specify scope, deliverables, assumptions, timetable,
              revision limits, fees, payment schedule, third-party costs,
              responsibilities, support, ownership, cancellation, and other
              project-specific terms.
            </p>
            <p>
              If a signed project agreement conflicts with these website Terms,
              the signed agreement controls for that project.
            </p>
          </section>

          <section id="terms-04">
            <span className="legal-number">04</span>
            <h2>Your responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>provide accurate instructions, timely feedback, approvals, content, access, and a decision-making contact;</li>
              <li>confirm that you have the rights and permissions needed for all content, data, branding, documents, and systems you provide;</li>
              <li>review deliverables and chatbot knowledge for accuracy before approval and launch;</li>
              <li>avoid providing unlawful, infringing, malicious, or unnecessarily sensitive information; and</li>
              <li>maintain suitable notices, consents, policies, human review, and procedures for your own customers and industry.</li>
            </ul>
            <p>
              Delays in content, access, feedback, or approvals may affect the
              schedule and may require a revised timeline or fee.
            </p>
          </section>

          <section id="terms-05">
            <span className="legal-number">05</span>
            <h2>Fees and payment</h2>
            <p>
              Prices are tailored to each project and confirmed in writing.
              Unless the project agreement states otherwise, deposits reserve
              production time, invoices are due by the stated date, and
              third-party costs are separate from our professional fees.
            </p>
            <p>
              We may pause work or withhold launch, transfer, or final files
              while an undisputed invoice is overdue. Deposits, refunds, late
              fees, taxes, and cancellation charges will be handled as stated
              in the applicable proposal and required by law.
            </p>
          </section>

          <section id="terms-06">
            <span className="legal-number">06</span>
            <h2>Intellectual property</h2>
            <p>
              You retain ownership of materials you provide. You grant us the
              limited rights needed to use those materials for the project.
            </p>
            <p>
              Ownership or licence rights in custom final deliverables will be
              stated in the project agreement and generally transfer only
              after full payment. Gemstone Labs retains ownership of its
              pre-existing tools, methods, reusable code, templates,
              know-how, and general skills. Third-party materials remain
              subject to their own licences.
            </p>
            <p>
              Unless confidentiality terms or the project agreement prohibit
              it, we may identify you as a client and display non-confidential
              completed work in our portfolio after public launch.
            </p>
          </section>

          <section id="terms-07">
            <span className="legal-number">07</span>
            <h2>AI and chatbot limitations</h2>
            <p>
              AI-assisted systems can misunderstand questions, produce
              incomplete information, or provide an inaccurate response.
              Chatbot output is not legal, medical, financial, safety, or other
              regulated professional advice and should not be the sole basis
              for high-impact decisions.
            </p>
            <p>
              Clients are responsible for approving knowledge sources,
              escalation paths, restricted topics, disclaimers, testing, and
              appropriate human oversight. We will use reasonable professional
              care but cannot guarantee that an AI system will be uninterrupted,
              error-free, or correct in every situation.
            </p>
          </section>

          <section id="terms-08">
            <span className="legal-number">08</span>
            <h2>Third-party services</h2>
            <p>
              Projects may use hosting platforms, domain registrars, analytics,
              payment providers, content systems, AI providers, APIs, plugins,
              fonts, or other third-party services. Their availability, pricing,
              terms, security, and functionality are controlled by them and may
              change.
            </p>
            <p>
              We are not responsible for a third-party service outside our
              reasonable control. Unless agreed otherwise, you are responsible
              for maintaining necessary accounts, licences, subscriptions, and
              compliance with third-party terms.
            </p>
          </section>

          <section id="terms-09">
            <span className="legal-number">09</span>
            <h2>Confidentiality</h2>
            <p>
              Each party will use reasonable care to protect confidential
              business information received for a project and use it only for
              the agreed purpose. This does not cover information already
              public, lawfully known without restriction, independently
              developed, or required to be disclosed by law.
            </p>
          </section>

          <section id="terms-10">
            <span className="legal-number">10</span>
            <h2>Acceptable use</h2>
            <p>You must not use our website, chatbot, or services to:</p>
            <ul>
              <li>break the law, violate another person’s rights, or distribute harmful or deceptive content;</li>
              <li>probe, disrupt, overload, scrape, reverse engineer, or bypass security without written permission;</li>
              <li>upload malicious code or attempt unauthorised access to data, systems, or accounts;</li>
              <li>impersonate another person, send spam, or manipulate chatbot behaviour for abuse; or</li>
              <li>build or support unlawful discrimination, surveillance, fraud, or other high-risk harmful uses.</li>
            </ul>
          </section>

          <section id="terms-11">
            <span className="legal-number">11</span>
            <h2>Warranties and liability</h2>
            <p>
              We provide the public website and demo chatbot on an “as
              available” basis. To the extent permitted by law, we disclaim
              implied warranties not expressly included in a signed project
              agreement.
            </p>
            <p>
              Neither party will be liable for indirect, incidental, special,
              punitive, or consequential loss, including lost profits,
              revenue, goodwill, or data, except where liability cannot legally
              be limited. Any project-specific liability cap or remedy will be
              stated in the signed agreement. Nothing in these Terms excludes
              liability that applicable law does not allow us to exclude.
            </p>
          </section>

          <section id="terms-12">
            <span className="legal-number">12</span>
            <h2>Ending services</h2>
            <p>
              Either party may end a project as allowed by its signed
              agreement. On termination, you remain responsible for approved
              work performed, committed third-party costs, and other amounts
              due under that agreement. We may suspend website or chatbot
              access for material breach, unlawful use, security risk, or
              overdue undisputed payment.
            </p>
          </section>

          <section id="terms-13">
            <span className="legal-number">13</span>
            <h2>Disputes and general terms</h2>
            <p>
              The parties should first try in good faith to resolve a dispute
              through direct discussion. Governing law, courts, or another
              dispute process for paid work will be stated in the signed
              project agreement. For use of this public website where no
              project agreement exists, applicable law will determine the
              governing rules and forum.
            </p>
            <p>
              If part of these Terms is unenforceable, the remaining terms
              continue. A delay in enforcing a term is not a waiver. You may
              not transfer your rights or obligations without our consent,
              except as permitted in a signed agreement.
            </p>
          </section>

          <section id="terms-14">
            <span className="legal-number">14</span>
            <h2>Changes and contact</h2>
            <p>
              We may update these Terms to reflect changes in our services,
              providers, or legal obligations. The updated version applies
              from the date shown above. Material changes to an active paid
              project will be handled according to its signed agreement.
            </p>
            <div className="legal-contact">
              <strong>Questions about these Terms</strong>
              <a href="mailto:hello@gemstonelabs.ai">hello@gemstonelabs.ai ↗</a>
            </div>
          </section>
        </article>
      </div>

      <footer className="legal-footer">
        <a className="brand" href="/">
          <span className="brand-mark">✦</span> GEMSTONE LABS
        </a>
        <div><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Service</a></div>
        <span>© 2026 Gemstone Labs</span>
      </footer>
    </main>
  );
}
