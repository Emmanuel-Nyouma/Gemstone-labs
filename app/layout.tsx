import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gemstone Labs — Helpful AI chatbots and business websites",
  description: "Gemstone Labs builds knowledge-powered customer chatbots and high-converting business websites that turn questions into qualified enquiries.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
