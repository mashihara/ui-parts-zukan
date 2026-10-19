import type { Metadata } from "next";
import "./globals.css";
import "../components/kit.css";
import { SITE_NAME, SITE_URL, TOP_DESCRIPTION, TOP_TITLE } from "@/lib/site";

// 共有画像の絶対URLの土台（ドメインだけ。サブパスは next.config の basePath から Next.js が足す）
const SITE = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: TOP_TITLE,
  description: TOP_DESCRIPTION,
  ...(SITE ? { metadataBase: new URL(SITE) } : {}),
  openGraph: {
    title: SITE_NAME, description: "その部品、なんて呼ぶ？画面に図面のように名前を書き込んだ、UI部品の名前の辞書。",
    type: "website", siteName: SITE_NAME, locale: "ja_JP", url: `${SITE_URL}/`,
  },
  twitter: { card: "summary_large_image" },
  // canonical は各ページで書く（ここに書くと全ページに継承され、部品のページもトップを指してしまう）
  alternates: { types: { "text/plain": `${SITE_URL}/llms.txt` } },
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
