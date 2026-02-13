import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "에이전틱 워크플로우 전문가 — Bruce Choe (brxce.ai)",
  description:
    "에이전틱 워크플로우 전문가 Bruce Choe. OpenClaw × ClaudeCode로 수십 개의 AI 에이전트를 직접 빌딩하며 얻은 실전 인사이트를 공유합니다.",
  keywords: [
    "에이전틱 워크플로우",
    "agentic workflow",
    "OpenClaw",
    "ClaudeCode",
    "AI 에이전트",
    "AI 자동화",
    "Bruce Choe",
  ],
  authors: [{ name: "Bruce Choe" }],
  openGraph: {
    title: "에이전틱 워크플로우 전문가 — Bruce Choe",
    description:
      "OpenClaw × ClaudeCode로 회사를 굴리는 개발자 CEO. 수십 개의 AI 에이전트를 직접 빌딩하며 얻은 실전 인사이트를 공유합니다.",
    type: "website",
    url: "https://brxce.ai",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary",
    site: "@brxce_ai",
    title: "에이전틱 워크플로우 전문가 — Bruce Choe",
    description:
      "OpenClaw × ClaudeCode로 수십 개의 AI 에이전트를 직접 빌딩. 실전 인사이트 공유.",
  },
  alternates: { canonical: "https://brxce.ai" },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "vfjysxq95d");`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Bruce Choe",
              alternateName: "최종혁",
              url: "https://brxce.ai",
              email: "bruce@brxce.ai",
              jobTitle: "CEO & Developer",
              worksFor: {
                "@type": "Organization",
                name: "IntelliEffect",
                url: "https://intellieffect.com",
              },
              knowsAbout: [
                "에이전틱 워크플로우",
                "Agentic Workflow",
                "OpenClaw",
                "ClaudeCode",
                "AI Agent",
              ],
              sameAs: [
                "https://www.threads.com/@brxce.ai",
                "https://x.com/brxce_ai",
                "https://www.linkedin.com/in/brxce",
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
