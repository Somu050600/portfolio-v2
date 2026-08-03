"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const SIM = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uAspect;
uniform vec2 uTexel;
uniform float uDissipation;
uniform float uRadius;
uniform float uAdvect;

void main() {
  vec2 prevV = texture2D(uPrev, vUv).xy;
  vec2 v = texture2D(uPrev, vUv - prevV * uAdvect).xy;

  vec2 nb = texture2D(uPrev, vUv + vec2(uTexel.x, 0.0)).xy
          + texture2D(uPrev, vUv - vec2(uTexel.x, 0.0)).xy
          + texture2D(uPrev, vUv + vec2(0.0, uTexel.y)).xy
          + texture2D(uPrev, vUv - vec2(0.0, uTexel.y)).xy;
  v = mix(v, nb * 0.25, 0.14);
  v *= uDissipation;

  vec2 d = vUv - uMouse;
  d.x *= uAspect;
  float fall = exp(-dot(d, d) / uRadius);
  v += uVel * fall;

  float m = length(v);
  if (m > 1.0) v *= 1.0 / m;

  gl_FragColor = vec4(v, 0.0, 1.0);
}`;

const DISP = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uField;
uniform sampler2D uTex;
uniform float uStrength;
uniform vec2 uTexel;
uniform float uSheen;

void main() {
  vec2 field = texture2D(uField, vUv).xy;
  float mag = length(field);
  vec2 uv = vUv + field * uStrength;

  vec2 ca = field * uStrength * 0.6;
  float r = texture2D(uTex, uv + ca).r;
  float g = texture2D(uTex, uv).g;
  float b = texture2D(uTex, uv - ca).b;
  vec3 col = vec3(r, g, b);

  float hx = length(texture2D(uField, vUv + vec2(uTexel.x, 0.0)).xy)
           - length(texture2D(uField, vUv - vec2(uTexel.x, 0.0)).xy);
  float hy = length(texture2D(uField, vUv + vec2(0.0, uTexel.y)).xy)
           - length(texture2D(uField, vUv - vec2(0.0, uTexel.y)).xy);
  vec3 n = normalize(vec3(-hx, -hy, 0.2));
  float spec = pow(max(dot(n, normalize(vec3(0.5, 0.6, 1.0))), 0.0), 16.0);
  col += spec * mag * uSheen;

  gl_FragColor = vec4(col, 1.0);
}`;

type LiquidDistortionDemoProps = {
  className?: string;
  autoplay?: boolean;
  variant?: "playground" | "thumbnail";
};

export function getLiquidPreviewPointer(timeMs: number) {
  const seconds = timeMs / 1_000;

  return {
    x: 0.5 + Math.sin(seconds * 1.35) * 0.28,
    y: 0.5 + Math.cos(seconds * 0.9) * 0.22,
  };
}

type Runtime = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  quad: THREE.Mesh<THREE.PlaneGeometry, THREE.Material>;
  geometry: THREE.PlaneGeometry;
  simMat: THREE.ShaderMaterial;
  dispMat: THREE.ShaderMaterial;
  bgTex: THREE.CanvasTexture;
  rtA: THREE.WebGLRenderTarget;
  rtB: THREE.WebGLRenderTarget;
  simRes: THREE.Vector2;
  uTexel: THREE.Vector2;
};

function drawBackground(
  canvas: HTMLCanvasElement,
  texture: THREE.CanvasTexture,
  w: number,
  h: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = w;
  canvas.height = h;

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#07141d");
  g.addColorStop(0.46, "#16132b");
  g.addColorStop(1, "#08251f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const blobs: Array<[number, number, string]> = [
    [w * 0.22, h * 0.32, "#0ea5e9"],
    [w * 0.78, h * 0.7, "#a855f7"],
    [w * 0.62, h * 0.22, "#14b8a6"],
  ];

  for (const [x, y, color] of blobs) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.42);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "transparent");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.fillStyle = "rgba(255,255,255,.08)";
  const step = Math.max(18, w / 48);
  for (let y = step; y < h; y += step) {
    for (let x = step; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#eef6ff";
  ctx.font = `700 ${Math.min(w * 0.14, 128)}px Georgia, serif`;
  ctx.fillText("LIQUID", w / 2, h * 0.5);
  ctx.fillStyle = "#9fb0ca";
  ctx.font = `${Math.min(w * 0.035, 20)}px ui-monospace, monospace`;
  ctx.fillText("move through the field", w / 2, h * 0.5 + Math.min(w * 0.08, 78));

  texture.needsUpdate = true;
}

function makeTargets(width: number, height: number) {
  const opts: THREE.RenderTargetOptions = {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };

  return [
    new THREE.WebGLRenderTarget(width, height, opts),
    new THREE.WebGLRenderTarget(width, height, opts),
  ] as const;
}

export default function LiquidDistortionDemo({
  className,
  autoplay = false,
  variant = "playground",
}: LiquidDistortionDemoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastPointerMoveRef = useRef(Number.NEGATIVE_INFINITY);
  const pointerRef = useRef({
    mouse: new THREE.Vector2(0.5, 0.5),
    last: new THREE.Vector2(0.5, 0.5),
    vel: new THREE.Vector2(0, 0),
  });
  const [trail, setTrail] = useState(0.96);
  const [strength, setStrength] = useState(0.22);
  const [size, setSize] = useState(28);

  const clearTargets = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    for (const target of [runtime.rtA, runtime.rtB]) {
      runtime.renderer.setRenderTarget(target);
      runtime.renderer.clear();
    }
    runtime.renderer.setRenderTarget(null);
  }, []);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const root: HTMLDivElement = rootEl;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 1);
    renderer.domElement.className = "absolute inset-0 h-full w-full";
    root.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const bg = document.createElement("canvas");
    const bgTex = new THREE.CanvasTexture(bg);
    bgTex.minFilter = THREE.LinearFilter;
    bgTex.magFilter = THREE.LinearFilter;
    bgTex.colorSpace = THREE.SRGBColorSpace;

    const simRes = new THREE.Vector2(1, 1);
    const uTexel = new THREE.Vector2(1, 1);
    const pointer = pointerRef.current;
    const sensitivity = reduced ? 1.2 : 4.0;

    const [rtA, rtB] = makeTargets(1, 1);

    const simMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: SIM,
      uniforms: {
        uPrev: { value: null },
        uMouse: { value: pointer.mouse },
        uVel: { value: pointer.vel },
        uAspect: { value: 1 },
        uTexel: { value: uTexel },
        uDissipation: { value: 0.96 },
        uRadius: { value: 28 / 10000 },
        uAdvect: { value: 0.4 },
      },
    });

    const dispMat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: DISP,
      uniforms: {
        uField: { value: null },
        uTex: { value: bgTex },
        uStrength: { value: reduced ? 0.06 : 0.22 },
        uTexel: { value: uTexel },
        uSheen: { value: reduced ? 0 : 5.0 },
      },
    });

    const quad = new THREE.Mesh(geometry, simMat);
    scene.add(quad);

    runtimeRef.current = {
      renderer,
      scene,
      camera,
      quad,
      geometry,
      simMat,
      dispMat,
      bgTex,
      rtA,
      rtB,
      simRes,
      uTexel,
    };

    function resize() {
      const runtime = runtimeRef.current;
      if (!runtime) return;

      const rect = root.getBoundingClientRect();
      const width = Math.max(2, Math.floor(rect.width));
      const height = Math.max(2, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(2, Math.floor(width * dpr));
      const pixelHeight = Math.max(2, Math.floor(height * dpr));
      const simWidth = Math.max(2, Math.floor(pixelWidth * 0.5));
      const simHeight = Math.max(2, Math.floor(pixelHeight * 0.5));

      runtime.renderer.setPixelRatio(dpr);
      runtime.renderer.setSize(width, height, false);
      drawBackground(bg, runtime.bgTex, pixelWidth, pixelHeight);

      runtime.rtA.dispose();
      runtime.rtB.dispose();
      const targets = makeTargets(simWidth, simHeight);
      runtime.rtA = targets[0];
      runtime.rtB = targets[1];
      runtime.simRes.set(simWidth, simHeight);
      runtime.uTexel.set(1 / simWidth, 1 / simHeight);
      runtime.simMat.uniforms.uAspect.value = width / height;
      clearTargets();
    }

    function onPointerMove(event: PointerEvent) {
      const rect = root.getBoundingClientRect();
      lastPointerMoveRef.current = performance.now();
      pointer.mouse.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      );
    }

    function onPointerLeave() {
      pointer.vel.set(0, 0);
    }

    function frame(timeMs: number) {
      const runtime = runtimeRef.current;
      if (!runtime) return;

      if (autoplay && timeMs - lastPointerMoveRef.current > 900) {
        const previewPointer = getLiquidPreviewPointer(timeMs);
        pointer.mouse.set(previewPointer.x, previewPointer.y);
      }

      pointer.vel.set(
        (pointer.mouse.x - pointer.last.x) * sensitivity,
        (pointer.mouse.y - pointer.last.y) * sensitivity,
      );
      if (pointer.vel.length() > 0.35) pointer.vel.setLength(0.35);
      pointer.last.copy(pointer.mouse);

      runtime.simMat.uniforms.uPrev.value = runtime.rtA.texture;
      runtime.quad.material = runtime.simMat;
      runtime.renderer.setRenderTarget(runtime.rtB);
      runtime.renderer.render(runtime.scene, runtime.camera);
      runtime.renderer.setRenderTarget(null);

      runtime.dispMat.uniforms.uField.value = runtime.rtB.texture;
      runtime.quad.material = runtime.dispMat;
      runtime.renderer.render(runtime.scene, runtime.camera);

      const next = runtime.rtA;
      runtime.rtA = runtime.rtB;
      runtime.rtB = next;

      frameRef.current = requestAnimationFrame(frame);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    resize();
    frameRef.current = requestAnimationFrame(frame);

    return () => {
      resizeObserver.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

      const runtime = runtimeRef.current;
      runtimeRef.current = null;
      if (!runtime) return;

      runtime.simMat.dispose();
      runtime.dispMat.dispose();
      runtime.geometry.dispose();
      runtime.bgTex.dispose();
      runtime.rtA.dispose();
      runtime.rtB.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [autoplay, clearTargets]);

  const updateTrail = (value: number) => {
    setTrail(value);
    const runtime = runtimeRef.current;
    if (runtime) runtime.simMat.uniforms.uDissipation.value = value;
  };

  const updateStrength = (value: number) => {
    setStrength(value);
    const runtime = runtimeRef.current;
    if (runtime) runtime.dispMat.uniforms.uStrength.value = value;
  };

  const updateSize = (value: number) => {
    setSize(value);
    const runtime = runtimeRef.current;
    if (runtime) runtime.simMat.uniforms.uRadius.value = value / 10000;
  };

  const isThumbnail = variant === "thumbnail";

  return (
    <div
      ref={rootRef}
      className={cn(
        isThumbnail
          ? "relative isolate h-full w-full overflow-hidden bg-black"
          : "relative isolate h-105 w-full overflow-hidden rounded-lg border border-border-color bg-black",
        className,
      )}
      style={{ touchAction: "none" }}
    >
      {!isThumbnail && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 p-4">
            <span className="font-mono text-[10px] tracking-[0.18em] text-white/55 uppercase">
              Momentum field
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.14em] text-white/45 uppercase sm:block">
              Swipe fast vs slow
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-20 w-[min(236px,calc(100%-2rem))] rounded-lg border border-white/10 bg-[#080b18]/70 px-4 py-3 font-mono text-[11px] text-slate-300 shadow-2xl backdrop-blur-md">
            <Control
              label="Trail / viscosity"
              value={trail.toFixed(2)}
              min={90}
              max={99}
              sliderValue={Math.round(trail * 100)}
              onChange={(value) => updateTrail(value / 100)}
            />
            <Control
              label="Distortion"
              value={strength.toFixed(2)}
              min={5}
              max={50}
              sliderValue={Math.round(strength * 100)}
              onChange={(value) => updateStrength(value / 100)}
            />
            <Control
              label="Ripple size"
              value={String(size)}
              min={8}
              max={60}
              sliderValue={size}
              onChange={updateSize}
            />
            <button
              type="button"
              onClick={clearTargets}
              className="mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-[10px] tracking-[0.14em] text-slate-300 uppercase transition-colors hover:border-white/25 hover:text-white"
            >
              Reset field
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  sliderValue,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  sliderValue: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-3 block last:mb-0">
      <span className="mb-1.5 flex justify-between gap-3 text-[10px] tracking-[0.12em] text-slate-400 uppercase">
        {label}
        <b className="font-normal text-slate-100">{value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={sliderValue}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-cyan-300"
      />
    </label>
  );
}
