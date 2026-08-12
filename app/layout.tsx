import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gemstone-labs.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gemstone Labs | AI Chatbots and Business Websites",
    template: "%s | Gemstone Labs",
  },
  description:
    "Gemstone Labs builds grounded AI chatbots and conversion-focused business websites that turn customer questions into qualified enquiries.",
  keywords: [
    "AI chatbot agency",
    "RAG chatbot for business",
    "business website agency",
    "customer support chatbot",
    "Gemstone Labs",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Gemstone Labs",
    title: "Gemstone Labs | AI Chatbots and Business Websites",
    description:
      "Grounded AI chatbots and conversion-focused business websites for clearer customer journeys.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gemstone Labs | AI Chatbots and Business Websites",
    description:
      "Grounded AI chatbots and conversion-focused business websites for clearer customer journeys.",
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
        name: "Gemstone Labs",
        url: siteUrl,
        logo: `${siteUrl}/favicon.svg`,
        email: "hello@gemstonelabs.ai",
        description:
          "Gemstone Labs builds grounded AI chatbots and business websites.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Gemstone Labs",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="en">
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
