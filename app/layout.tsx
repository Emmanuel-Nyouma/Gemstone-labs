import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gemstone-labs.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SmartG Automation | AI Chatbots, Voice Agents and Websites",
    template: "%s | SmartG Automation",
  },
  description:
    "SmartG Automation builds grounded AI chatbots, voice agents, and conversion-focused business websites that turn customer questions into qualified enquiries.",
  keywords: [
    "AI chatbot agency",
    "RAG chatbot for business",
    "business website agency",
    "customer support chatbot",
    "voice AI agent",
    "voice chatbot for business",
    "SmartG Automation",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "SmartG Automation",
    title: "SmartG Automation | AI Chatbots, Voice Agents and Websites",
    description:
      "Grounded AI chatbots, voice agents, and conversion-focused business websites for clearer customer journeys.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartG Automation | AI Chatbots, Voice Agents and Websites",
    description:
      "Grounded AI chatbots, voice agents, and conversion-focused business websites for clearer customer journeys.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "SmartG Automation",
        url: siteUrl,
        logo: `${siteUrl}/favicon.svg`,
        email: "hello@smartg.agency",
        description:
          "SmartG Automation builds grounded AI chatbots, voice agents, and business websites.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "SmartG Automation",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
