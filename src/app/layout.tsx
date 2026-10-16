import type { Metadata } from "next";
import "./globals.css";
import "../components/kit.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "UIつまみ — 部品の名前が分かり、つまみでAIへの指示になる",
  description:
    "ヘッダー・モーダル・ラジオボタンなど、UI部品の名前を画面から調べ、角の丸さや余白をつまみで調整して、そのままAIへの指示文にできるサイト。",
  ...(SITE ? { metadataBase: new URL(SITE) } : {}),
  openGraph: { title: "UIつまみ", description: "UI部品の名前が分かり、つまみで調整した見た目がそのままAIへの指示文になる。", type: "website" },
  alternates: { types: { "text/plain": "/llms.txt" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Zen+Maru+Gothic:wght@400;500;700;900&family=Zen+Old+Mincho:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
