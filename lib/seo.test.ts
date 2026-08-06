import { describe, expect, test } from "bun:test";
import * as seo from "./seo";

type JsonLdNode = {
  "@type": string;
  "@id": string;
  [key: string]: unknown;
};

type SeoStructuredData = {
  rootJsonLd?: { "@context": string; "@graph": readonly JsonLdNode[] };
  aboutJsonLd?: { "@context": string; "@graph": readonly JsonLdNode[] };
  serializeJsonLd?: (value: unknown) => string;
};

const structuredData = seo as SeoStructuredData;

describe("structured identity data", () => {
  test("connects the WebSite publisher to the one canonical Person entity", () => {
    const graph = structuredData.rootJsonLd?.["@graph"] ?? [];
    const person = graph.find((node) => node["@type"] === "Person");
    const website = graph.find((node) => node["@type"] === "WebSite");

    expect(person).toMatchObject({
      "@id": "https://eega.dev/#person",
      name: "Eega Somasekhara Reddy",
      alternateName: ["Somu", "Somu Eega"],
      url: "https://eega.dev",
      mainEntityOfPage: "https://eega.dev/home/about",
      jobTitle: "Frontend Engineer",
    });
    expect(website).toMatchObject({
      "@id": "https://eega.dev/#website",
      url: "https://eega.dev",
      publisher: { "@id": "https://eega.dev/#person" },
    });
    expect(graph.filter((node) => node["@type"] === "Person")).toHaveLength(1);
  });

  test("makes the About ProfilePage reference the same Person ID", () => {
    const graph = structuredData.aboutJsonLd?.["@graph"] ?? [];

    expect(graph).toEqual([
      {
        "@type": "ProfilePage",
        "@id": "https://eega.dev/home/about#profile-page",
        url: "https://eega.dev/home/about",
        name: "Eega Somasekhara Reddy — Frontend Engineer",
        mainEntity: { "@id": "https://eega.dev/#person" },
      },
    ]);
  });

  test("escapes HTML-significant characters before injecting JSON-LD", () => {
    expect(structuredData.serializeJsonLd?.({ name: "</script>" })).toBe(
      '{"name":"\\u003c/script>"}',
    );
  });
});
