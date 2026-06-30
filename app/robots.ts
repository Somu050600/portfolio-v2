import type { MetadataRoute } from "next";
import { profile } from "@/lib/profile.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Explicitly welcome AI crawlers/agents — this is a portfolio; citations
      // and discovery are wanted. Context for them lives in /llms.txt + JSON-LD.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${profile.url}/sitemap.xml`,
    host: profile.url,
  };
}
