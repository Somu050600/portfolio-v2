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

export const aboutSkills = [
  { no: "01", symbol: "Js", name: "JAVASCRIPT", group: "languages" },
  { no: "02", symbol: "Ts", name: "TYPESCRIPT", group: "languages" },
  { no: "03", symbol: "C++", name: "C PLUS PLUS", group: "languages" },
  { no: "04", symbol: "Py", name: "PYTHON", group: "languages" },
  { no: "05", symbol: "Hc", name: "HTML/CSS", group: "languages" },
  { no: "06", symbol: "Re", name: "REACT", group: "frameworks" },
  { no: "07", symbol: "Nx", name: "NEXT.JS", group: "frameworks" },
  { no: "08", symbol: "Rn", name: "REACT NATIVE", group: "frameworks" },
  { no: "09", symbol: "Dj", name: "DJANGO", group: "frameworks" },
  { no: "10", symbol: "Rs", name: "REST", group: "frameworks" },
  { no: "11", symbol: "Je", name: "JEST", group: "frameworks" },
  { no: "12", symbol: "Rx", name: "REDUX", group: "state" },
  { no: "13", symbol: "Rq", name: "REACT QUERY", group: "state" },
  { no: "14", symbol: "Sw", name: "SWR", group: "state" },
  { no: "15", symbol: "Tw", name: "TAILWIND", group: "ui" },
  { no: "16", symbol: "Mu", name: "MUI", group: "ui" },
  { no: "17", symbol: "An", name: "ANT DESIGN", group: "ui" },
  { no: "18", symbol: "Ck", name: "CHAKRA", group: "ui" },
  { no: "19", symbol: "Pa", name: "RN PAPER", group: "ui" },
  { no: "20", symbol: "Gi", name: "GIT", group: "tooling" },
  { no: "21", symbol: "Dk", name: "DOCKER", group: "tooling" },
  { no: "22", symbol: "Vi", name: "VITE", group: "tooling" },
  { no: "23", symbol: "Gc", name: "GCP", group: "tooling" },
  { no: "24", symbol: "Pm", name: "POSTMAN", group: "tooling" },
] as const satisfies ReadonlyArray<{
  no: string;
  symbol: string;
  name: string;
  group: AboutSkillGroup;
}>;

export const aboutPathStops = [
  { title: "Chemistry", caption: "M.SC · BITS PILANI" },
  { title: "Civil", caption: "B.E · BITS PILANI" },
  { title: "Frontend", caption: "THE CRAFT OF INTERFACES" },
] as const;

export const careAbout = [
  "Interfaces that feel fast before they are technically fast.",
  "Design systems that survive contact with real product pressure.",
  "Motion with intent — never decoration for its own sake.",
  "Accessible defaults: keyboard paths, contrast, reduced-motion respect.",
  "Shipping small, measurable wins instead of big-bang rewrites.",
] as const;
