export type HomeNavKey =
  | "work"
  | "experience"
  | "about"
  | "photography"
  | "playground";

export type HomeNavItem = {
  key: HomeNavKey;
  label: string;
  href: string;
  /** Derived from position, never authored. See `ordinal`. */
  ordinal: string;
};

/**
 * The one list of sections. Every menu on the site renders this array, and the
 * printed ordinals come from position, so a reorder can't leave `04` meaning
 * Photography in one menu and Playground in another.
 */
export const homeNavItems: HomeNavItem[] = (
  [
    { key: "work", label: "Work", href: "/home" },
    { key: "experience", label: "Experience", href: "/home/experience" },
    { key: "about", label: "About", href: "/home/about" },
    { key: "photography", label: "Photography", href: "/home/photography" },
    { key: "playground", label: "Playground", href: "/home/playground" },
  ] satisfies Omit<HomeNavItem, "ordinal">[]
).map((item, index) => ({
  ...item,
  ordinal: String(index + 1).padStart(2, "0"),
}));

/**
 * Index of the home section a pathname belongs to, matching `homeNavItems`
 * order (work=0 … playground=4). Returns -1 for non-section routes. Uses
 * prefix matching so case-study slugs map to their parent section, useful
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
