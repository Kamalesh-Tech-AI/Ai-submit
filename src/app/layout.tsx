import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | AI Submit 2026",
    default: "AI Submit 2026 — Architecting Autonomous Skills",
  },
  description: "Join AI Submit 2026 in Chennai, India — a free conference organized by UNAI Tech focused on building practical AI engineering and autonomous systems skills in students and professionals.",
  keywords: ["AI Submit 2026", "AI Conference Chennai", "UNAI Tech", "AI EdTech", "Autonomous Systems", "AI Engineering", "Free AI Training"],
  authors: [{ name: "UNAI Tech" }],
  openGraph: {
    title: "AI Submit 2026 — Chennai's Premier Free AI Conference",
    description: "Build practical AI engineering skills. Hosted by UNAI Tech. Register free for your QR entry pass.",
    type: "website",
    locale: "en_US",
    siteName: "AI Submit 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Submit 2026 — Free AI Conference",
    description: "Learn practical AI engineering skills from industry leaders in Chennai. Organised by UNAI Tech.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="bg-[#F4F6F9] text-[#002060] min-h-full flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex flex-col bg-[#F4F6F9]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
