"use client";

/**
 * TEMPORARY instrumentation for the circle-reveal origin bug
 * (Chrome starts the circle somewhere other than the EXPLORE button; Brave —
 * also Chromium — starts it at the button).
 *
 * Enable:  localStorage.setItem("vtdebug", "1")   — or load any page with ?vtdebug=1
 * Disable: localStorage.removeItem("vtdebug")
 *
 * A/B the suspect CSS rule (`::view-transition-group(root) { animation: none }`,
 * added on this branch):
 *   localStorage.setItem("vtGroupAnim", "1")  → restores the UA group animation
 *   localStorage.removeItem("vtGroupAnim")    → current behaviour
 *
 * Delete this file and its call sites once the root cause is fixed.
 */

const ROOT_PSEUDOS = [
  "::view-transition-group(root)",
  "::view-transition-image-pair(root)",
  "::view-transition-old(root)",
  "::view-transition-new(root)",
] as const;

const GEOMETRY_PROPS = [
  "width",
  "height",
  "inline-size",
  "block-size",
  "top",
  "left",
  "position",
  "transform",
  "transform-origin",
  "clip-path",
  "object-fit",
  "object-position",
  "overflow",
  "z-index",
  "animation-name",
  "animation-duration",
] as const;

const MARKER_NAME = "vt-origin-marker";
const MARKER_ID = "vt-origin-marker";

let cached: boolean | null = null;

function readFlag(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function isVtDebug() {
  if (typeof window === "undefined") return false;
  if (cached !== null) return cached;

  try {
    const param = new URL(window.location.href).searchParams.get("vtdebug");
    if (param === "1") window.localStorage.setItem("vtdebug", "1");
    if (param === "0") window.localStorage.removeItem("vtdebug");
  } catch {
    /* storage blocked */
  }

  cached = readFlag("vtdebug");
  return cached;
}

/** Sets html[data-vt-group-anim] so globals.css skips the animation:none rule. */
export function applyVtGroupAnimFlag() {
  if (!isVtDebug()) return;
  const root = document.documentElement;
  if (readFlag("vtGroupAnim")) root.setAttribute("data-vt-group-anim", "");
  else root.removeAttribute("data-vt-group-anim");
}

/* ---------------------------------------------------------------------------
   One report per transition. Stages accumulate, then flush as a SINGLE object:
   right-click → "Copy object" in devtools, or paste — it is also written to the
   clipboard as JSON and parked on window.__vtReport (devtools: copy(__vtReport)).
   --------------------------------------------------------------------------- */

type Report = Record<string, unknown>;

let report: Report | null = null;

/** Every debug flag, verbatim — so a pasted report says which run it was. */
export function flagsSnapshot() {
  const keys = ["vtdebug", "vtGroupAnim", "vtSlow", "vtPx"];
  const out: Record<string, string | null> = {};
  let all: Record<string, string> | string;

  try {
    for (const key of keys) out[key] = window.localStorage.getItem(key);
    all = Object.fromEntries(
      Object.keys(window.localStorage).map((key) => [
        key,
        String(window.localStorage.getItem(key)).slice(0, 120),
      ]),
    );
  } catch (error) {
    all = `unreadable: ${String(error)}`;
  }

  return {
    debugFlags: out,
    groupAnimAttr: document.documentElement.hasAttribute("data-vt-group-anim"),
    allLocalStorage: all,
  };
}

export function vtReportStart(meta: Report) {
  if (!isVtDebug()) return;
  report = { meta: { ...meta, flags: flagsSnapshot() }, stages: {} };
}

export function vtStage(label: string, data: unknown) {
  if (!isVtDebug() || !report) return;
  (report.stages as Report)[label] = data;
}

export async function vtReportFlush() {
  if (!isVtDebug() || !report) return;
  const payload = report;
  report = null;

  const json = safeJson(payload);

  (window as Window & { __vtReport?: unknown }).__vtReport = payload;

  let clipboard = "not attempted";
  try {
    await navigator.clipboard.writeText(json);
    clipboard = "copied to clipboard";
  } catch (error) {
    clipboard = `clipboard blocked (${String(error)}) — use copy(__vtReport)`;
  }

  console.log(
    `%c[vt] REPORT — ${clipboard}`,
    "color:#526f5c;font-weight:600",
    payload,
  );
}

function safeJson(value: unknown) {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === "object" && val !== null) {
        if (seen.has(val as object)) return "[circular]";
        seen.add(val as object);
      }
      if (typeof val === "function") return "[function]";
      return val;
    },
    2,
  );
}

export function viewportSnapshot() {
  const de = document.documentElement;
  const vv = window.visualViewport;
  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    clientWidth: de.clientWidth,
    clientHeight: de.clientHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    scrollbarWidth: window.innerWidth - de.clientWidth,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    scrollHeight: de.scrollHeight,
    bodyScrollHeight: document.body?.scrollHeight ?? null,
    devicePixelRatio: window.devicePixelRatio,
    // Non-1 scale or non-zero offset = pinch/visual-viewport shift, which moves
    // getBoundingClientRect relative to what the snapshot pseudo sees.
    vvWidth: vv?.width ?? null,
    vvHeight: vv?.height ?? null,
    vvScale: vv?.scale ?? null,
    vvOffsetLeft: vv?.offsetLeft ?? null,
    vvOffsetTop: vv?.offsetTop ?? null,
    // browser zoom estimate (CSS px per screen px)
    zoomEstimate: Number((window.outerWidth / window.innerWidth).toFixed(3)),
    htmlStyleZoom: getComputedStyle(de).zoom,
  };
}

export function pseudoStyles() {
  const de = document.documentElement;
  const out: Record<string, Record<string, string> | string> = {};

  for (const pseudo of ROOT_PSEUDOS) {
    try {
      const style = getComputedStyle(de, pseudo);
      const entry: Record<string, string> = {};
      for (const prop of GEOMETRY_PROPS) {
        entry[prop] = style.getPropertyValue(prop);
      }
      out[pseudo] = entry;
    } catch (error) {
      out[pseudo] = `unreadable: ${String(error)}`;
    }
  }

  return out;
}

/**
 * The UA group animation's keyframes carry the exact OLD → NEW group geometry.
 * Only present when the animation is not suppressed (vtGroupAnim=1), which is
 * why the A/B toggle exists.
 */
export function animationsSnapshot() {
  try {
    return document.getAnimations().map((animation) => {
      const effect = animation.effect as KeyframeEffect | null;
      let keyframes: unknown = null;
      try {
        keyframes = effect?.getKeyframes();
      } catch {
        keyframes = "unreadable";
      }
      return {
        animationName: (animation as CSSAnimation).animationName ?? null,
        pseudoElement: effect?.pseudoElement ?? null,
        target: (effect?.target as Element | null)?.tagName ?? null,
        playState: animation.playState,
        timing: effect?.getTiming() ?? null,
        keyframes,
      };
    });
  } catch (error) {
    return `unreadable: ${String(error)}`;
  }
}

export async function browserSnapshot() {
  const uaData = (
    navigator as Navigator & {
      userAgentData?: {
        brands: { brand: string; version: string }[];
        getHighEntropyValues: (hints: string[]) => Promise<unknown>;
      };
    }
  ).userAgentData;

  let highEntropy: unknown = null;
  try {
    highEntropy = await uaData?.getHighEntropyValues([
      "fullVersionList",
      "platformVersion",
    ]);
  } catch {
    highEntropy = "unavailable";
  }

  return {
    userAgent: navigator.userAgent,
    brands: uaData?.brands ?? null,
    highEntropy,
    isBrave: "brave" in navigator,
    supportsVT: typeof document.startViewTransition === "function",
    groupAnimRestored: document.documentElement.hasAttribute(
      "data-vt-group-anim",
    ),
  };
}

/** localStorage vtSlow=1 → stretch the reveal so it can be screenshotted. */
export function revealDuration(normal: number) {
  return isVtDebug() && readFlag("vtSlow") ? 8000 : normal;
}

/**
 * localStorage vtPx=1 → force the old px clip space back on, to re-demo the
 * Chrome dpr bug the percentage reveal fixed. Production always uses %.
 */
export function forcePxClip() {
  return isVtDebug() && readFlag("vtPx");
}

/**
 * Calibration overlay in the NEW document: a dot + full-viewport crosshair at
 * the origin we asked for, plus ruler ticks every 100px. Tagged with its own
 * view-transition-name so it is painted THROUGH the transition (root snapshots
 * otherwise hide live DOM) — and, being its own group, it is NOT subject to
 * whatever the root snapshot's pixel space is doing. Screenshot mid-animation:
 * circle centre vs crosshair = the exact error.
 */
export function mountOriginMarker(x: number, y: number) {
  if (!isVtDebug()) return;
  document.getElementById(MARKER_ID)?.remove();

  const layer = document.createElement("div");
  layer.id = MARKER_ID;
  layer.style.cssText = [
    "position:fixed",
    "inset:0",
    "pointer-events:none",
    "z-index:2147483647",
    `view-transition-name:${MARKER_NAME}`,
  ].join(";");

  const line = (css: string) => {
    const el = document.createElement("div");
    el.style.cssText = `position:absolute;background:#ff2d55;${css}`;
    layer.appendChild(el);
  };

  // Crosshair through the requested origin.
  line(`left:0;right:0;top:${y}px;height:1px;opacity:0.9`);
  line(`top:0;bottom:0;left:${x}px;width:1px;opacity:0.9`);

  // 100px ruler ticks from the viewport origin, so a screenshot is measurable.
  for (let px = 100; px < Math.max(window.innerWidth, window.innerHeight); px += 100) {
    const major = px % 500 === 0;
    if (px < window.innerWidth) {
      line(
        `top:0;left:${px}px;width:1px;height:${major ? 18 : 9}px;opacity:${major ? 0.85 : 0.45}`,
      );
    }
    if (px < window.innerHeight) {
      line(
        `left:0;top:${px}px;height:1px;width:${major ? 18 : 9}px;opacity:${major ? 0.85 : 0.45}`,
      );
    }
  }

  const dot = document.createElement("div");
  dot.style.cssText = [
    "position:absolute",
    `left:${x}px`,
    `top:${y}px`,
    "width:16px",
    "height:16px",
    "margin:-8px 0 0 -8px",
    "border-radius:50%",
    "border:2px solid #ff2d55",
    "background:rgba(255,45,85,0.35)",
  ].join(";");
  layer.appendChild(dot);

  const label = document.createElement("div");
  label.textContent = `requested origin ${Math.round(x)},${Math.round(y)} · viewport ${window.innerWidth}×${window.innerHeight} · window ${window.outerWidth}×${window.outerHeight} · dpr ${window.devicePixelRatio}`;
  label.style.cssText = [
    "position:absolute",
    "left:6px",
    "top:6px",
    "font:11px/1.4 monospace",
    "color:#ff2d55",
    "background:rgba(0,0,0,0.72)",
    "padding:3px 6px",
  ].join(";");
  layer.appendChild(label);

  document.body.appendChild(layer);
}

export function unmountOriginMarker(delayMs = 2500) {
  if (!isVtDebug()) return;
  window.setTimeout(() => document.getElementById(MARKER_ID)?.remove(), delayMs);
}
