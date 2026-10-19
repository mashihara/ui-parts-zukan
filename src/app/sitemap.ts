import type { MetadataRoute } from "next";
import { PARTS } from "@/lib/parts";
import { SITE_URL, partPath } from "@/lib/site";

// 静的書き出しで sitemap.xml を作る（トップと43部品のページ）
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, priority: 1 }, ...PARTS.map((p) => ({ url: `${SITE_URL}${partPath(p.id)}`, priority: 0.8 }))];
}
