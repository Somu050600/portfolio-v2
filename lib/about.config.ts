export const aboutSkillGroups = [
  { key: "all", label: "ALL" },
  { key: "languages", label: "LANGUAGES" },
  { key: "frameworks", label: "FRAMEWORKS" },
  { key: "state", label: "STATE & DATA" },
  { key: "ui", label: "UI" },
  { key: "tooling", label: "TOOLING" },
] as const;

export type AboutSkillFilter = (typeof aboutSkillGroups)[number]["key"];
export type AboutSkillGroup = Exclude<AboutSkillFilter, "all">;

/**
 * Trimmed to the tools I would defend in an interview, and extended to cover
 * what the site itself is built out of (Storybook, GSAP, Three.js, the View
 * Transitions API). A flat grid of every library ever touched reads as keyword
 * coverage, which is the opposite of the intended signal.
 */
const aboutSkillDefinitions = [
  { symbol: "Js", name: "JAVASCRIPT", group: "languages" },
  { symbol: "Ts", name: "TYPESCRIPT", group: "languages" },
  { symbol: "Py", name: "PYTHON", group: "languages" },
  { symbol: "Go", name: "GO", group: "languages" },
  { symbol: "Re", name: "REACT", group: "frameworks" },
  { symbol: "Nx", name: "NEXT.JS", group: "frameworks" },
  { symbol: "Rn", name: "REACT NATIVE", group: "frameworks" },
  { symbol: "No", name: "NODE.JS", group: "frameworks" },
  { symbol: "Rs", name: "REST", group: "state" },
  { symbol: "Rx", name: "REDUX", group: "state" },
  { symbol: "Rq", name: "REACT QUERY", group: "state" },
  { symbol: "Tw", name: "TAILWIND", group: "ui" },
  { symbol: "Sb", name: "STORYBOOK", group: "ui" },
  { symbol: "Gs", name: "GSAP", group: "ui" },
  { symbol: "Th", name: "THREE.JS", group: "ui" },
  { symbol: "Vt", name: "VIEW TRANSITIONS", group: "ui" },
  { symbol: "Gi", name: "GIT", group: "tooling" },
  { symbol: "Dk", name: "DOCKER", group: "tooling" },
  { symbol: "Vi", name: "VITE", group: "tooling" },
  { symbol: "Je", name: "JEST", group: "tooling" },
] as const satisfies ReadonlyArray<{
  symbol: string;
  name: string;
  group: AboutSkillGroup;
}>;

/** Atomic numbers come from position, so inserting an element renumbers the table. */
export const aboutSkills = aboutSkillDefinitions.map((skill, index) => ({
  ...skill,
  no: String(index + 1).padStart(2, "0"),
}));

export const aboutPathStops = [
  { title: "Chemistry", caption: "M.SC · BITS PILANI" },
  { title: "Civil", caption: "B.E · BITS PILANI" },
  { title: "Frontend", caption: "THE CRAFT OF INTERFACES" },
] as const;

export const careAbout = [
  "Interfaces that feel fast before they are technically fast.",
  "Design systems that survive contact with real product pressure.",
  "Motion with intent, never decoration for its own sake.",
  "Accessible defaults: keyboard paths, contrast, reduced-motion respect.",
  "Shipping small, measurable wins instead of big-bang rewrites.",
] as const;

/**
 * The long-way-round paragraph. Drafted copy: the specifics of what
 * transferred are the memorable part of this page, so keep them true.
 */
export const aboutNarrative = [
  "Two things carried over. Lab work taught me to change one variable at a time and write down what actually happened, which turns out to be most of debugging. Civil taught me to think in tolerances and load paths, the same instinct that now goes into token layers, cache boundaries, and what a component does under the worst real payload rather than the demo one.",
  "Interfaces won because the feedback loop is immediate: a bad decision is visible on the first interaction, and fixable the same afternoon.",
] as const;
