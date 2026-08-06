export type HomeNavKey =
  | "work"
  | "experience"
  | "about"
  | "photography"
  | "playground";

export const homeNavItems: {
  key: HomeNavKey;
  label: string;
  href: string;
}[] = [
  { key: "work", label: "01. Work", href: "/home" },
  { key: "experience", label: "02. Experience", href: "/home/experience" },
  { key: "about", label: "03. About", href: "/home/about" },
  {
    key: "photography",
    label: "04. Photography",
    href: "/home/photography",
  },
  { key: "playground", label: "05. Playground", href: "/home/playground" },
];

/**
 * Index of the home section a pathname belongs to, matching `homeNavItems`
 * order (work=0 … playground=4). Returns -1 for non-section routes. Uses
 * prefix matching so case-study slugs map to their parent section — useful
 * for computing slide direction, distinct from exact-href section detection.
 */
export function homeSectionIndex(pathname: string): number {
  if (pathname.startsWith("/home/experience")) return 1;
  if (pathname.startsWith("/home/about")) return 2;
  if (pathname.startsWith("/home/photography")) return 3;
  if (pathname.startsWith("/home/playground")) return 4;
  if (pathname === "/home" || pathname.startsWith("/home/work")) return 0;
  return -1;
}

/** True when the pathname is exactly one of the five top-level section routes. */
export function isHomeSectionRoute(pathname: string): boolean {
  return homeNavItems.some((item) => item.href === pathname);
}
