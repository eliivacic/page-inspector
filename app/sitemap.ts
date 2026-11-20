import type { MetadataRoute } from "next";

const BASE = "https://www.page-inspector.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
  ];
}
