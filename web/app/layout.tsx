import type { Metadata } from "next";
import { Poppins, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const BASE_URL = "https://educai-web.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "EducAI — AI-Powered Study Abroad Platform",
    template: "%s · EducAI",
  },
  description:
    "Find the right university program, discover scholarships, and build your step-by-step application strategy — powered by live data and AI reasoning.",
  keywords: [
    "study abroad",
    "university programs",
    "scholarships",
    "visa guidance",
    "international education",
    "AI study planner",
    "study in Germany",
    "study in Canada",
    "study in UK",
    "study in Australia",
    "graduate school",
    "master's programs",
    "study abroad platform",
  ],
  authors: [{ name: "EducAI" }],
  creator: "EducAI",
  publisher: "EducAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "EducAI",
    title: "EducAI — AI-Powered Study Abroad Platform",
    description:
      "Find the right university program, discover scholarships, and build your step-by-step application strategy — powered by live data and AI reasoning.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EducAI — AI-Powered Study Abroad Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EducAI — AI-Powered Study Abroad Platform",
    description:
      "Find the right university program, discover scholarships, and build your step-by-step application strategy — powered by live data and AI reasoning.",
    images: ["/og-image.png"],
    creator: "@educai",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
