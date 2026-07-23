"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Gauge, SlidersHorizontal } from "lucide-react";
import * as THREE from "three";
import { createBrowserMetricsSource } from "@/lib/performance/browserMetrics";
import { PerformanceMonitor } from "@/lib/performance/PerformanceMonitor";
import { createThreeMetricsSource } from "@/lib/performance/threeMetrics";
import ResourceUsagePanel from "./ResourceUsagePanel";
import TweaksPanel from "./TweaksPanel";
import { DEFAULTS, type HeroProps } from "./somuHero3dConfig";

// Subscribe to prefers-reduced-motion as an external store so the initial
// toggle state is hydration-safe (server snapshot is always false).
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ACCENT = "#6B7245";
const INK = "#2E2B25";

// Mutable Three.js objects the Tweaks panel drives after setup.
type SceneRefs = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  bg: THREE.Color;
  camera: THREE.PerspectiveCamera;
  camTarget: THREE.Vector3;
  spot: THREE.SpotLight;
  spotTarget: THREE.Object3D;
  targBaseX: number;
  amb: THREE.AmbientLight;
  hemi: THREE.HemisphereLight;
  fill: THREE.DirectionalLight;
  top: THREE.DirectionalLight;
  wallMat: THREE.MeshStandardMaterial;
  floorMat: THREE.MeshStandardMaterial;
  rockMat: THREE.MeshStandardMaterial;
  leafMat: THREE.MeshStandardMaterial;
  group: THREE.Group;
};

function disposeMaterialResources(
  material: THREE.Material,
  disposedMaterials: Set<THREE.Material>,
  disposedTextures: Set<THREE.Texture>,
) {
  if (disposedMaterials.has(material)) return;

  for (const value of Object.values(
    material as THREE.Material & Record<string, unknown>,
  )) {
    if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
      value.dispose();
      disposedTextures.add(value);
    }
  }

  material.dispose();
  disposedMaterials.add(material);
}

function disposeSceneResources(scene: THREE.Scene) {
  const disposedGeometries = new Set<THREE.BufferGeometry>();
  const disposedMaterials = new Set<THREE.Material>();
  const disposedTextures = new Set<THREE.Texture>();

  scene.traverse((object) => {
    if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) {
      if (!disposedGeometries.has(object.geometry)) {
        object.geometry.dispose();
        disposedGeometries.add(object.geometry);
      }
    }

    if ("material" in object) {
      const { material } = object;
      if (Array.isArray(material)) {
        material.forEach((item) => {
          if (item instanceof THREE.Material) {
            disposeMaterialResources(item, disposedMaterials, disposedTextures);
          }
        });
      } else if (material instanceof THREE.Material) {
        disposeMaterialResources(material, disposedMaterials, disposedTextures);
      }
    }
  });
}

/**
 * "Somu Hero 3D" — a full-viewport hero rendering a warm plaster room in
 * Three.js: a stone boulder and a stylised eucalyptus sprig lit by a single
 * angled spotlight that pools on the back wall. A photographer's viewfinder
 * (corner brackets, focus rings, film grain) frames centred copy.
 *
 * Ported from the Claude Design source ("Somu Hero 3D.dc.html"), including its
 * live "Tweaks" editor — every editor prop is wired to the scene in real time.
 */

type Props = {
  /** font-family for the serif display heading (defaults to Newsreader). */
  serifFont?: string;
  /** font-family for mono UI text (defaults to IBM Plex Mono). */
  monoFont?: string;
};

export default function SomuHero3D({
  serifFont = "'Newsreader', Georgia, serif",
  monoFont = "'IBM Plex Mono', ui-monospace, monospace",
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  // Effective reduced-motion: system preference unless the user flips it.
  const systemReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const reduced = override ?? systemReduced;
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  const toggleReduced = () => setOverride(!reduced);

  // Live tweakable scene props + the panel open state.
  const [props, setProps] = useState<HeroProps>(DEFAULTS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [resourceExpanded, setResourceExpanded] = useState(false);
  const [resourceMonitor, setResourceMonitor] =
    useState<PerformanceMonitor | null>(null);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const three = useRef<SceneRefs | null>(null);

  const setProp = <K extends keyof HeroProps>(key: K, value: HeroProps[K]) =>
    setProps((prev) => ({ ...prev, [key]: value }));

  const isNarrow = () => window.matchMedia("(max-width: 720px)").matches;
  const toggleTweaks = () => {
    setPanelOpen((open) => {
      const next = !open;
      if (next && isNarrow()) setResourceExpanded(false);
      return next;
    });
  };
  const setResourcesExpanded = (next: boolean) => {
    setResourceExpanded(next);
    if (next && isNarrow()) setPanelOpen(false);
  };

  // Apply the current props to the live scene (skips X of spot/camera, which
  // the rAF loop owns for parallax).
  useEffect(() => {
    const s = three.current;
    if (!s) return;
    const p = props;
    s.spot.intensity = p.spotIntensity;
    s.spot.angle = p.spotAngle;
    s.spot.penumbra = p.spotPenumbra;
    s.spot.decay = p.spotDecay;
    s.spot.color.set(p.spotColor);
    s.spot.position.y = p.spotY;
    s.spot.position.z = p.spotZ;
    s.renderer.toneMappingExposure = p.exposure;
    s.amb.intensity = p.ambientIntensity;
    s.hemi.intensity = p.hemiIntensity;
    s.fill.intensity = p.fillIntensity;
    s.top.intensity = p.topIntensity;
    s.bg.set(p.bgColor);
    s.wallMat.color.set(p.wallColor);
    s.wallMat.bumpScale = p.wallBump;
    s.floorMat.color.set(p.floorColor);
    s.rockMat.color.set(p.rockColor);
    s.leafMat.color.set(p.leafColor);
    s.group.scale.setScalar(p.objScale);
    s.camera.position.z = p.camZ;
  }, [props]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const P = propsRef.current;

    // Coarse pointers (touch) get a static scene with no parallax; the
    // reduced-motion preference is already reflected in `reducedRef`.
    const forceStatic = window.matchMedia("(pointer: coarse)").matches;

    // --- pointer parallax target (-0.5..0.5), eased in the loop ---
    const p = { x: 0, y: 0 };
    const c = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      if (reducedRef.current || forceStatic) return;
      p.x = e.clientX / window.innerWidth - 0.5;
      p.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ---------- procedural plaster texture helpers ----------
    // Multi-octave value noise → cloudy plaster grayscale canvas.
    const fractalCanvas = (size: number) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = size;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = "rgb(128,128,128)";
      ctx.fillRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = true;
      const octs: [number, number][] = [
        [4, 0.3],
        [11, 0.26],
        [32, 0.24],
        [95, 0.15],
        [230, 0.1],
      ];
      // Fine per-pixel grain for a sharper, sandier plaster surface.
      const fine = ctx.createImageData(size, size);
      for (let i = 0; i < size * size; i++) {
        const v = Math.random() * 255;
        fine.data[i * 4] = fine.data[i * 4 + 1] = fine.data[i * 4 + 2] = v;
        fine.data[i * 4 + 3] = 255;
      }
      const fc = document.createElement("canvas");
      fc.width = fc.height = size;
      fc.getContext("2d")!.putImageData(fine, 0, 0);
      for (const [cell, alpha] of octs) {
        const s = Math.max(2, Math.round(size / cell));
        const sm = document.createElement("canvas");
        sm.width = sm.height = s;
        const sc = sm.getContext("2d")!;
        const id = sc.createImageData(s, s);
        for (let i = 0; i < s * s; i++) {
          const v = Math.random() * 255;
          id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
          id.data[i * 4 + 3] = 255;
        }
        sc.putImageData(id, 0, 0);
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(sm, 0, 0, size, size);
      }
      ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(fc, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      return cv;
    };

    // Tint a grayscale canvas over a base colour → subtle albedo map.
    const tintCanvas = (gray: HTMLCanvasElement, base: string, amt: number) => {
      const size = gray.width;
      const cv = document.createElement("canvas");
      cv.width = cv.height = size;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = amt;
      ctx.globalCompositeOperation = "overlay";
      ctx.drawImage(gray, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      return cv;
    };

    const plaster = (base: string, tintAmt: number, repeat: [number, number]) => {
      const gray = fractalCanvas(512);
      const map = new THREE.CanvasTexture(tintCanvas(gray, base, tintAmt));
      map.colorSpace = THREE.SRGBColorSpace;
      const bump = new THREE.CanvasTexture(gray);
      for (const t of [map, bump]) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeat[0], repeat[1]);
      }
      return { map, bump };
    };

    const radialAlpha = () => {
      const size = 256;
      const cv = document.createElement("canvas");
      cv.width = cv.height = size;
      const ctx = cv.getContext("2d")!;
      const g = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      g.addColorStop(0, "rgba(0,0,0,0.6)");
      g.addColorStop(0.45, "rgba(0,0,0,0.32)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(cv);
    };

    // ---------- renderer / scene / camera ----------
    let w = root.clientWidth;
    let h = root.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = P.exposure;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    if (fallbackRef.current) fallbackRef.current.style.opacity = "0";

    const scene = new THREE.Scene();
    scene.name = "Somu room";
    const bg = new THREE.Color(P.bgColor);
    scene.background = bg;

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(P.camX, P.camY, P.camZ);
    const camTarget = new THREE.Vector3(0, 1.6, -1);
    camera.lookAt(camTarget);

    // ---------- room (texture tint fixed; material.color carries tweaks) ----
    const wallTex = plaster("#c9c2b0", 0.32, [2, 1.25]);
    wallTex.map.name = "Wall plaster albedo";
    wallTex.bump.name = "Wall plaster bump";
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex.map,
      bumpMap: wallTex.bump,
      bumpScale: P.wallBump,
      roughness: 0.97,
      metalness: 0,
    });
    wallMat.name = "Wall plaster material";
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 16), wallMat);
    wall.name = "Back wall";
    wall.geometry.name = "Back wall geometry";
    wall.position.set(0, 6, -2.6);
    wall.receiveShadow = true;
    scene.add(wall);

    const floorTex = plaster("#c2baa6", 0.18, [4, 4]);
    floorTex.map.name = "Floor plaster albedo";
    floorTex.bump.name = "Floor plaster bump";
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex.map,
      bumpMap: floorTex.bump,
      bumpScale: 0.006,
      roughness: 0.85,
      metalness: 0,
    });
    floorMat.name = "Floor plaster material";
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), floorMat);
    floor.name = "Floor";
    floor.geometry.name = "Floor geometry";
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 1);
    floor.receiveShadow = true;
    scene.add(floor);

    // ---------- lights ----------
    const hemi = new THREE.HemisphereLight("#efe9db", "#8f8873", P.hemiIntensity);
    scene.add(hemi);
    const amb = new THREE.AmbientLight("#d8d2c4", P.ambientIntensity);
    scene.add(amb);

    // Main lamp: angled spotlight pooling on the back wall + lighting objects.
    const spot = new THREE.SpotLight(
      P.spotColor,
      P.spotIntensity,
      40,
      P.spotAngle,
      P.spotPenumbra,
      P.spotDecay,
    );
    spot.name = "Main spotlight shadow";
    spot.position.set(P.spotX, P.spotY, P.spotZ);
    spot.castShadow = true;
    spot.shadow.mapSize.set(2048, 2048);
    spot.shadow.camera.near = 1;
    spot.shadow.camera.far = 30;
    spot.shadow.bias = -0.0003;
    spot.shadow.radius = 5;
    spot.shadow.blurSamples = 24;
    scene.add(spot);

    // Soft top-down key for grounded contact shadows on the floor.
    const top = new THREE.DirectionalLight("#f2ecdd", P.topIntensity);
    top.name = "Top key shadow";
    top.position.set(-1.5, 9, 2.5);
    top.target.position.set(-2.4, 0, 0.8);
    top.castShadow = true;
    top.shadow.mapSize.set(2048, 2048);
    top.shadow.camera.near = 1;
    top.shadow.camera.far = 20;
    top.shadow.camera.left = -8;
    top.shadow.camera.right = 8;
    top.shadow.camera.top = 8;
    top.shadow.camera.bottom = -8;
    top.shadow.bias = -0.0004;
    top.shadow.radius = 4;
    scene.add(top);
    scene.add(top.target);

    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0.5, 3.4, -2.55);
    scene.add(spotTarget);
    spot.target = spotTarget;
    const targBaseX = spotTarget.position.x;

    // Warm fill from front-left so shadowed objects keep detail.
    const fill = new THREE.DirectionalLight("#e4ddcd", P.fillIntensity);
    fill.position.set(-3, 4.5, 6);
    scene.add(fill);

    // ---------- objects, bottom-left, resting on the floor ----------
    const group = new THREE.Group();
    group.name = "Boulder and eucalyptus";
    group.position.set(-2.35, 0, 0.9);
    group.scale.setScalar(P.objScale);
    scene.add(group);

    // Soft blob contact-shadow decal directly under the objects.
    const blobMat = new THREE.MeshBasicMaterial({
      map: radialAlpha(),
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });
    blobMat.name = "Contact shadow material";
    if (blobMat.map) blobMat.map.name = "Contact shadow alpha";
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.2), blobMat);
    blob.name = "Contact shadow decal";
    blob.geometry.name = "Contact shadow geometry";
    blob.rotation.x = -Math.PI / 2;
    blob.position.set(-2.15, 0.015, 1.0);
    blob.renderOrder = 1;
    scene.add(blob);

    // 1) Boulder — smooth noisy icosahedron flattened into a low slab.
    const rockGeo = new THREE.IcosahedronGeometry(1.0, 5);
    rockGeo.name = "Boulder geometry";
    const rpos = rockGeo.attributes.position;
    const rv = new THREE.Vector3();
    for (let i = 0; i < rpos.count; i++) {
      rv.fromBufferAttribute(rpos, i);
      const d =
        0.14 * Math.sin(rv.x * 2.1 + 1.7) +
        0.11 * Math.cos(rv.y * 2.6) +
        0.1 * Math.sin(rv.z * 2.3 + 0.6);
      rv.multiplyScalar(1 + d);
      rpos.setXYZ(i, rv.x, rv.y, rv.z);
    }
    rockGeo.computeVertexNormals();
    const rockMat = new THREE.MeshStandardMaterial({
      color: P.rockColor,
      roughness: 1.0,
      metalness: 0,
    });
    rockMat.name = "Boulder material";
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.name = "Boulder";
    rock.scale.set(1.35, 0.8, 1.05);
    rock.position.set(0, 0.6, 0);
    rock.rotation.set(0.04, 0.5, -0.06);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);

    // 2) Stylised eucalyptus — thin curved stem + spread leaf pairs.
    const stemMat = new THREE.MeshStandardMaterial({
      color: "#5c6647",
      roughness: 0.85,
    });
    stemMat.name = "Eucalyptus stem material";
    const leafMat = new THREE.MeshStandardMaterial({
      color: P.leafColor,
      roughness: 0.66,
      metalness: 0,
    });
    leafMat.name = "Eucalyptus leaf material";
    const plant = new THREE.Group();
    plant.name = "Eucalyptus";
    plant.position.set(0.2, 0.85, -0.4);
    plant.rotation.z = 0.18;
    const segs = 7;
    const segLen = 0.4;
    let cy = 0;
    let curl = 0.1;
    for (let s = 0; s < segs; s++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.02, segLen, 8),
        stemMat,
      );
      seg.geometry.name ||= "Eucalyptus stem geometry";
      curl += 0.055;
      const sx = Math.sin(curl) * 0.16;
      seg.position.set(sx, cy + segLen / 2, 0);
      seg.rotation.z = -curl;
      seg.castShadow = true;
      plant.add(seg);
      if (s > 0) {
        for (const side of [-1, 1]) {
          const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 14, 12),
            leafMat,
          );
          leaf.geometry.name ||= "Eucalyptus leaf geometry";
          leaf.scale.set(1.0, 1.45, 0.12);
          leaf.position.set(sx + side * 0.2, cy + segLen * 0.35, 0.02 * side);
          leaf.rotation.set(0.15, side * 0.3, side * 1.05 - curl);
          leaf.castShadow = true;
          plant.add(leaf);
        }
      }
      cy += segLen * 0.82;
    }
    group.add(plant);

    const monitor = new PerformanceMonitor({
      sources: [
        createBrowserMetricsSource(canvas),
        createThreeMetricsSource(renderer, scene),
      ],
    });
    const monitorReadyRaf = requestAnimationFrame(() => {
      setResourceMonitor(monitor);
    });

    three.current = {
      renderer,
      scene,
      bg,
      camera,
      camTarget,
      spot,
      spotTarget,
      targBaseX,
      amb,
      hemi,
      fill,
      top,
      wallMat,
      floorMat,
      rockMat,
      leafMat,
      group,
    };

    // ---------- resize ----------
    const onResize = () => {
      w = root.clientWidth;
      h = root.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(root);

    // ---------- loop ----------
    let raf = 0;
    const loop = () => {
      const cur = propsRef.current;
      const on = !reducedRef.current && !forceStatic;
      const tx = on ? p.x : 0;
      const ty = on ? p.y : 0;
      c.x += (tx - c.x) * 0.06;
      c.y += (ty - c.y) * 0.06;

      const px = cur.parallax;
      camera.position.x = cur.camX + c.x * 0.7 * px;
      camera.position.y = cur.camY - c.y * 0.35 * px;
      camera.lookAt(camTarget);

      // The lamp drifts subtly, so the wall pool shifts with the cursor.
      spot.position.x = cur.spotX + c.x * 0.9 * px;
      spotTarget.position.x = targBaseX + c.x * 0.7 * px;
      spotTarget.updateMatrixWorld();

      renderer.render(scene, camera);
      monitor.recordFrame(performance.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(monitorReadyRaf);
      ro.disconnect();
      monitor.dispose();
      disposeSceneResources(scene);
      renderer.renderLists.dispose();
      renderer.dispose();
      three.current = null;
    };
  }, []);

  const trackStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    width: 38,
    height: 20,
    borderRadius: 20,
    padding: 2,
    transition: "background .25s ease",
    background: reduced ? ACCENT : "rgba(46,43,37,.22)",
    justifyContent: reduced ? "flex-end" : "flex-start",
  };
  const knobStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#f4efe3",
    boxShadow: "0 1px 2px rgba(0,0,0,.25)",
  };
  const sceneToolButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontFamily: monoFont,
    fontSize: 11,
    letterSpacing: 0,
    color: "#5c574b",
    padding: 0,
  };

  return (
    <section
      ref={rootRef}
      id="hero-root"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 560,
        overflow: "hidden",
        fontFamily: monoFont,
        color: INK,
        background: "#c9c2b3",
      }}
    >
      <style>{`
        #hero-root a { color: inherit; text-decoration: none; }
        #hero-root [data-nav]:hover,
        #hero-root [data-enter]:hover { color: ${ACCENT}; }
        #hero-root [data-enter]:hover { gap: 18px; }
        #hero-root [data-rm]:hover { color: ${INK}; }
        #hero-root [data-tweaks]:hover { color: ${INK}; }
      `}</style>

      <canvas
        ref={canvasRef}
        id="gl"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 1,
        }}
      />

      {/* 3D loading fallback */}
      <div
        ref={fallbackRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(70% 60% at 55% 32%, #efeadd 0%, #d9d2c1 55%, #c1b9a6 100%)",
        }}
      />

      {/* Concentric focus rings behind copy */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          width: "min(120vh,66vw)",
          height: "min(120vh,66vw)",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(46,43,37,.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "9%",
            borderRadius: "50%",
            border: "1px solid rgba(46,43,37,.07)",
          }}
        />
      </div>

      {/* Viewfinder brackets */}
      <div
        style={{
          position: "absolute",
          left: "clamp(20px,26vw,420px)",
          top: "clamp(16px,30vh,300px)",
          width: 38,
          height: 38,
          borderLeft: "1.5px solid rgba(46,43,37,.55)",
          borderTop: "1.5px solid rgba(46,43,37,.55)",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "clamp(20px,26vw,420px)",
          top: "clamp(16px,30vh,300px)",
          width: 38,
          height: 38,
          borderRight: "1.5px solid rgba(46,43,37,.55)",
          borderTop: "1.5px solid rgba(46,43,37,.55)",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "clamp(20px,26vw,420px)",
          bottom: "clamp(16px,26vh,260px)",
          width: 38,
          height: 38,
          borderLeft: "1.5px solid rgba(46,43,37,.55)",
          borderBottom: "1.5px solid rgba(46,43,37,.55)",
          zIndex: 6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "clamp(20px,26vw,420px)",
          bottom: "clamp(16px,26vh,260px)",
          width: 38,
          height: 38,
          borderRight: "1.5px solid rgba(46,43,37,.55)",
          borderBottom: "1.5px solid rgba(46,43,37,.55)",
          zIndex: 6,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: 7,
            height: 7,
            background: ACCENT,
            borderRadius: "50%",
            opacity: 0,
          }}
        />
      </div>

      {/* Top bar */}
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(20px,3.2vh,34px) clamp(24px,4vw,64px)",
        }}
      >
        <a
          href="#"
          style={{
            fontWeight: 500,
            fontSize: "clamp(20px,2.2vw,26px)",
            letterSpacing: ".42em",
            paddingLeft: ".42em",
            color: INK,
          }}
        >
          SOMU
        </a>
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(18px,2.6vw,44px)",
            fontSize: "clamp(13px,1.05vw,15px)",
            letterSpacing: ".02em",
          }}
        >
          <a href="#" data-nav>
            Work
          </a>
          <a href="#" data-nav>
            Photography
          </a>
          <a href="#" data-nav>
            About
          </a>
          <a href="#" data-nav>
            Contact
          </a>
        </nav>
      </header>

      {/* Center copy */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "47%",
          transform: "translate(-50%,-50%)",
          zIndex: 7,
          width: "min(760px,86vw)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontFamily: serifFont,
            fontWeight: 400,
            fontSize: "clamp(34px,5vw,72px)",
            lineHeight: 1.06,
            letterSpacing: "-.01em",
            margin: 0,
            textWrap: "balance",
          }}
        >
          Engineering interfaces with a{" "}
          <span style={{ color: ACCENT }}>photographer&rsquo;s eye</span> for
          focus, framing, and{" "}
          <span style={{ color: ACCENT, fontStyle: "italic" }}>detail</span>.
        </h1>
        <p
          style={{
            margin: "clamp(22px,3.4vh,34px) 0 0",
            fontSize: "clamp(14px,1.2vw,17px)",
            letterSpacing: ".08em",
            color: "#3a362d",
          }}
        >
          Frontend Engineer
        </p>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "clamp(12px,1.05vw,15px)",
            letterSpacing: ".06em",
            color: "#5c574b",
          }}
        >
          React&nbsp;&nbsp;&middot;&nbsp;&nbsp;Next.js&nbsp;&nbsp;&middot;&nbsp;&nbsp;Design
          Systems&nbsp;&nbsp;&middot;&nbsp;&nbsp;Photography
        </p>
        <a
          href="#"
          data-enter
          style={{
            pointerEvents: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginTop: "clamp(26px,4vh,40px)",
            fontSize: "clamp(13px,1.1vw,16px)",
            letterSpacing: ".22em",
            color: ACCENT,
            fontWeight: 500,
            transition: "gap .25s ease",
          }}
        >
          ENTER <span style={{ fontSize: "1.1em" }}>&rarr;</span>
        </a>
      </div>

      {/* Film grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 9,
          pointerEvents: "none",
          mixBlendMode: "overlay",
          opacity: 0.5,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          backgroundSize: "150px 150px",
        }}
      />

      {/* Scene tools */}
      <div
        style={{
          position: "absolute",
          left: "clamp(20px,3.4vw,48px)",
          bottom: "clamp(18px,3vh,34px)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <button
          type="button"
          onClick={toggleTweaks}
          aria-expanded={panelOpen}
          data-tweaks
          style={sceneToolButtonStyle}
        >
          <SlidersHorizontal size={13} aria-hidden="true" /> TWEAKS
        </button>
        <button
          type="button"
          onClick={() => setResourceOpen((open) => !open)}
          aria-expanded={resourceOpen}
          data-tweaks
          style={sceneToolButtonStyle}
        >
          <Gauge size={13} aria-hidden="true" /> RESOURCES
        </button>
      </div>

      {/* Reduced motion toggle */}
      <button
        type="button"
        onClick={toggleReduced}
        aria-pressed={reduced}
        data-rm
        style={{
          position: "absolute",
          right: "clamp(20px,3.4vw,48px)",
          bottom: "clamp(18px,3vh,34px)",
          zIndex: 10,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          border: 0,
          background: "transparent",
          cursor: "pointer",
          fontFamily: monoFont,
          fontSize: 11,
          letterSpacing: ".18em",
          color: "#5c574b",
          padding: 0,
        }}
      >
        REDUCED MOTION
        <span style={trackStyle}>
          <span style={knobStyle} />
        </span>
      </button>

      {resourceOpen && resourceMonitor && (
        <ResourceUsagePanel
          monitor={resourceMonitor}
          expanded={resourceExpanded}
          monoFont={monoFont}
          onExpandedChange={setResourcesExpanded}
          onClose={() => setResourceOpen(false)}
        />
      )}

      {panelOpen && (
        <TweaksPanel
          values={props}
          monoFont={monoFont}
          onChange={setProp}
          onReset={() => setProps(DEFAULTS)}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </section>
  );
}
