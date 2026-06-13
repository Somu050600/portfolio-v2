export type HomeNavKey = "work" | "experience" | "about" | "playground";

export const homeNavItems: {
  key: HomeNavKey;
  label: string;
  href: string;
}[] = [
  { key: "work", label: "01. Work", href: "/home" },
  { key: "experience", label: "02. Experience", href: "/home/experience" },
  { key: "about", label: "03. About", href: "/home/about" },
  { key: "playground", label: "04. Playground", href: "/home/playground" },
];
