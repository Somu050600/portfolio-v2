import type { Metadata } from "next";
import { profile } from "./profile.config";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  type?: "website" | "article";
  absoluteTitle?: boolean;
};

export const homepageTitle = `${profile.name} (${profile.handle}) — ${profile.jobTitle}`;
export const homepageDescription = `Portfolio of ${profile.name}, also known as ${profile.handle} — a frontend engineer specialising in React, Next.js, TypeScript, design systems and web performance.`;

export const seoEntityIds = {
  person: `${profile.url}/#person`,
  website: `${profile.url}/#website`,
  profilePage: `${profile.url}/home/about#profile-page`,
} as const;

export const rootJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": seoEntityIds.person,
      name: profile.name,
      alternateName: profile.alternateNames,
      url: profile.url,
      mainEntityOfPage: `${profile.url}/home/about`,
      jobTitle: profile.jobTitle,
      description: profile.shortDescription,
      email: `mailto:${profile.contact.email}`,
      sameAs: [profile.contact.github, profile.contact.linkedin],
      knowsAbout: [
        "Frontend Engineering",
        "React",
        "Next.js",
        "TypeScript",
        "Design Systems",
        "Web Performance",
      ],
    },
    {
      "@type": "WebSite",
      "@id": seoEntityIds.website,
      url: profile.url,
      name: profile.name,
      alternateName: [profile.handle, "eega.dev"],
      publisher: { "@id": seoEntityIds.person },
    },
  ],
} as const;

export const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": seoEntityIds.profilePage,
      url: `${profile.url}/home/about`,
      name: `${profile.name} — ${profile.jobTitle}`,
      mainEntity: { "@id": seoEntityIds.person },
    },
  ],
} as const;

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} · ${profile.name}`;
  const sharedOpenGraph = {
    url: path,
    siteName: profile.name,
    title: socialTitle,
    description,
    locale: "en_US",
  } as const;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph:
      type === "article"
        ? {
            ...sharedOpenGraph,
            type: "article",
            authors: [`${profile.url}/home/about`],
          }
        : { ...sharedOpenGraph, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
