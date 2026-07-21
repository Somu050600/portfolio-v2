"use client";

import { Environment, ContactShadows, PerspectiveCamera, useGLTF, useProgress } from "@react-three/drei";
import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { Group } from "three";

type TargetRef = MutableRefObject<{ x: number; y: number }>;

function RockModel() {
  // Swap point: drop a CC0 /public/models/rock.glb file in the repo and this
  // loader will replace the primitive below with the real asset.
  const gltf = useGLTF("/models/rock.glb");
  return <primitive object={gltf.scene} scale={1.45} position={[0, -0.55, 0]} />;
}

function PlaceholderRock() {
  return (
    <mesh position={[0, -0.45, 0]} rotation={[0.28, -0.35, 0.18]} castShadow={false} receiveShadow={false}>
      {/* An icosahedron is cheap, faceted, and rock-like enough for learning before
          the CC0 GLB exists. Increase detail later only if the silhouette needs it. */}
      <icosahedronGeometry args={[1.15, 2]} />
      <meshStandardMaterial color="#9b927f" roughness={0.82} metalness={0.03} />
    </mesh>
  );
}

function AssetOrPlaceholder() {
  const [hasRock, setHasRock] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    // A cheap HEAD check prevents useGLTF from throwing while the lab asset is absent.
    fetch("/models/rock.glb", { method: "HEAD" })
      .then((response) => !cancelled && setHasRock(response.ok))
      .catch(() => !cancelled && setHasRock(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (hasRock === null) return null;
  return hasRock ? <RockModel /> : <PlaceholderRock />;
}

function Scene({ target }: { target: TargetRef }) {
  const group = useRef<Group>(null);
  const cur = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!group.current) return;

    cur.current.x += (target.current.x - cur.current.x) * 0.08;
    cur.current.y += (target.current.y - cur.current.y) * 0.08;
    group.current.rotation.y = cur.current.x * 0.25;
    group.current.rotation.x = -cur.current.y * 0.15;

    // frameloop="demand" sleeps by default; self-invalidate only while easing
    // so the cursor parallax settles instead of becoming a permanent 60fps loop.
    if (
      Math.abs(target.current.x - cur.current.x) > 0.001 ||
      Math.abs(target.current.y - cur.current.y) > 0.001
    ) {
      invalidate();
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={38} />
      <group ref={group}>
        {/* Keep Suspense inside Canvas: this avoids reload/context-loss issues in
            Next when WebGL work suspends outside the renderer tree. */}
        <Suspense fallback={null}>
          <AssetOrPlaceholder />
          {/* The preset loads an HDRI over the network. That is fine for this lab;
              self-host the .hdr in production to avoid third-party fetch variance. */}
          <Environment preset="studio" />
        </Suspense>
      </group>
      {/* ContactShadows is a baked-looking helper: it grounds the object without
          enabling expensive real-time shadow maps/lights. */}
      <ContactShadows position={[0, -1.55, 0]} opacity={0.34} scale={5} blur={2.4} far={3} />
    </>
  );
}

export default function R3FCanvasIsland() {
  const target = useRef({ x: 0, y: 0 });
  const { progress } = useProgress();
  const isLoaded = progress >= 100;

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-[2rem] border border-stone-300/70 bg-[#e8e1d5] shadow-2xl shadow-stone-900/10">
      <Canvas
        // Render only when something changes; the GPU should be idle at rest.
        frameloop="demand"
        // Cap DPR because full retina DPR can be 4x the pixels for subtle UI 3D.
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        className={`transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onPointerMove={(e) => {
          target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
          target.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
          invalidate();
        }}
      >
        <color attach="background" args={["#e8e1d5"]} />
        <Scene target={target} />
      </Canvas>

      <div className={`pointer-events-none absolute inset-0 grid place-items-center bg-[#e8e1d5]/95 transition-opacity duration-500 ${isLoaded ? "opacity-0" : "opacity-100"}`}>
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-stone-500">Loading 3D lab</p>
          <p className="mt-3 text-sm text-stone-600">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
