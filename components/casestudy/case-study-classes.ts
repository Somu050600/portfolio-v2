export const caseStudyMono =
  "[font-family:var(--font-cs-jetbrains)] not-italic";

export const caseStudyProse =
  "text-[clamp(15.5px,1.2vw,16px)] leading-[1.78] font-normal tracking-[-0.005em] text-ink-dim text-pretty max-[480px]:leading-[1.75]";

export const caseStudyMetaKey = `${caseStudyMono} text-[9px] leading-none font-medium tracking-[0.16em] text-ink-faint uppercase`;

export const caseStudyCaption = `${caseStudyMono} text-[11px] leading-4.25 font-normal text-ink-faint`;

export const caseStudyArtifact =
  "min-w-0 max-[480px]:relative max-[480px]:left-1/2 max-[480px]:w-screen max-[480px]:-translate-x-1/2 max-[480px]:overflow-x-auto max-[480px]:overflow-y-hidden max-[480px]:rounded-none";

export const caseStudyDarkSurface =
  "overflow-hidden rounded-[10px] border border-thumb-border bg-thumb-bg text-thumb-ink max-[480px]:rounded-none";

export const caseStudyCodeHeader = `${caseStudyMono} flex items-center justify-between gap-4 border-b border-thumb-border bg-white/5 px-3.25 py-2.25 text-[10px] leading-none font-medium tracking-[0.08em] text-thumb-ink-faint uppercase`;

export const caseStudyCodeBody =
  "overflow-x-auto bg-thumb-bg p-3.5 [&_code]:[font-family:var(--font-cs-jetbrains)] [&_code]:text-[13px] [&_code]:leading-[1.75] [&_code]:font-normal [&_code]:text-thumb-ink-dim";

export const caseStudyCodeNote =
  "px-3.5 pt-3.5 text-sm leading-[1.65] font-normal text-thumb-ink-dim text-pretty";

export const caseStudyCodeToggle = `${caseStudyMono} absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-thumb-border bg-thumb-bg/90 px-2.5 py-1.5 text-[11px] font-medium text-thumb-ink shadow-xl backdrop-blur-md transition-colors hover:bg-thumb-bg`;
