import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { NoiseTexture } from "@/components/ui/noise-texture";
import { NavProgress } from "@/components/ui/nav-progress";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EducAI",
  url: BASE_URL,
  logo: `${BASE_URL}/icon.svg`,
  description:
    "AI-powered study abroad platform — program matching, scholarship discovery, visa guidance, and application strategy.",
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EducAI",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/study-abroad?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <a href="#main-content" className="skip-to-content">Skip to content</a>
          <NoiseTexture />
          <NavProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
