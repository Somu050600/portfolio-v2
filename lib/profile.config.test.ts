import { expect, test } from "bun:test";
import { GET as getLlmsText } from "@/app/llms.txt/route";
import { profile } from "./profile.config";

test("keeps the public identity in one canonical profile", () => {
  expect(profile).toMatchObject({
    name: "Eega Somasekhara Reddy",
    handle: "Somu",
    alternateNames: ["Somu", "Somu Eega"],
    url: "https://eega.dev",
    jobTitle: "Frontend Engineer",
    shortDescription:
      "Frontend engineer specialising in React, Next.js, TypeScript, design systems and web performance.",
  });
});

test("generates llms.txt from the canonical identity and public routes", async () => {
  const response = getLlmsText();
  const body = await response.text();

  expect(response.headers.get("content-type")).toBe(
    "text/plain; charset=utf-8",
  );
  expect(body).toContain(
    "# Eega Somasekhara Reddy (Somu) — Frontend Engineer",
  );
  expect(body).toContain("Canonical website: https://eega.dev");
  expect(body).toContain("React, Next.js, TypeScript, design systems and web performance");
  expect(body).toContain("[About](https://eega.dev/home/about)");
  expect(body).toContain("[Experience](https://eega.dev/home/experience)");
});
