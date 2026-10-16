import type { Metadata } from "next";
import "./globals.css";
import "../components/kit.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "UIつまみ — その部品、なんて呼ぶ？UI部品の名前が分かる図面",
  description:
    "ヘッダー・モーダル・ダイアログ・ラジオボタンなど、UI部品の正式な名前を図面から調べ、意味・使いどころ・AIへの頼み方が分かるサイト。",
  ...(SITE ? { metadataBase: new URL(SITE) } : {}),
  openGraph: { title: "UIつまみ", description: "その部品、なんて呼ぶ？画面に図面のように名前を書き込んだ、UI部品の名前の辞書。", type: "website" },
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
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
