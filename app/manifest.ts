import type { MetadataRoute } from "next";
import { profile } from "@/lib/profile.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} (${profile.handle}) · ${profile.jobTitle}`,
    short_name: profile.handle,
    description: profile.bio,
    start_url: "/",
    display: "standalone",
    background_color: "#ece8df",
    theme_color: "#ece8df",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
