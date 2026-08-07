"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type PanoramaViewerProps = {
  src: string;
  posterSrc: string;
  alt: string;
  transitionName?: string;
  onInteractive?: () => void;
};

export const PANORAMA_INITIAL_YAW_DEGREES = 180;

export function createPanoramaControls() {
  return { yaw: PANORAMA_INITIAL_YAW_DEGREES, pitch: 0, fov: 72 };
}

export default function PanoramaViewer({
  src,
  posterSrc,
  alt,
  transitionName,
  onInteractive,
}: PanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef(createPanoramaControls());
  const renderRef = useRef<(() => void) | null>(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let cleanup = () => {};

    void import("three").then((THREE) => {
      if (disposed) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const geometry = new THREE.SphereGeometry(10, 64, 40);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      const render = () => {
        const { yaw, pitch, fov } = controlsRef.current;
        camera.fov = fov;
        camera.updateProjectionMatrix();
        const phi = THREE.MathUtils.degToRad(90 - pitch);
        const theta = THREE.MathUtils.degToRad(yaw);
        camera.lookAt(
          10 * Math.sin(phi) * Math.cos(theta),
          10 * Math.cos(phi),
          10 * Math.sin(phi) * Math.sin(theta),
        );
        renderer.render(scene, camera);
      };
      renderRef.current = render;

      const resize = () => {
        const { clientWidth, clientHeight } = mount;
        if (!clientWidth || !clientHeight) return;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        render();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      performance.mark("photo-panorama-open");
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        src,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.needsUpdate = true;
          render();
          setInteractive(true);
          performance.mark("photo-panorama-interactive");
          performance.measure(
            "photo-panorama-open-to-interactive",
            "photo-panorama-open",
            "photo-panorama-interactive",
          );
          onInteractive?.();
        },
        undefined,
        () => setInteractive(false),
      );

      let pointerId: number | null = null;
      let previousX = 0;
      let previousY = 0;
      const onPointerDown = (event: PointerEvent) => {
        pointerId = event.pointerId;
        previousX = event.clientX;
        previousY = event.clientY;
        renderer.domElement.setPointerCapture(event.pointerId);
      };
      const onPointerMove = (event: PointerEvent) => {
        if (pointerId !== event.pointerId) return;
        const controls = controlsRef.current;
        controls.yaw -= (event.clientX - previousX) * 0.12;
        controls.pitch = Math.max(
          -80,
          Math.min(80, controls.pitch + (event.clientY - previousY) * 0.12),
        );
        previousX = event.clientX;
        previousY = event.clientY;
        render();
      };
      const onPointerUp = (event: PointerEvent) => {
        if (pointerId === event.pointerId) pointerId = null;
      };
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        controlsRef.current.fov = Math.max(
          42,
          Math.min(90, controlsRef.current.fov + event.deltaY * 0.025),
        );
        render();
      };
      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerup", onPointerUp);
      renderer.domElement.addEventListener("pointercancel", onPointerUp);
      renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

      cleanup = () => {
        renderRef.current = null;
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        renderer.domElement.removeEventListener("pointermove", onPointerMove);
        renderer.domElement.removeEventListener("pointerup", onPointerUp);
        renderer.domElement.removeEventListener("pointercancel", onPointerUp);
        renderer.domElement.removeEventListener("wheel", onWheel);
        material.map?.dispose();
        material.dispose();
        geometry.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [onInteractive, src]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const controls = controlsRef.current;
    if (event.key === "ArrowLeft") controls.yaw -= 5;
    else if (event.key === "ArrowRight") controls.yaw += 5;
    else if (event.key === "ArrowUp") controls.pitch = Math.min(80, controls.pitch + 5);
    else if (event.key === "ArrowDown") controls.pitch = Math.max(-80, controls.pitch - 5);
    else return;
    event.preventDefault();
    event.stopPropagation();
    renderRef.current?.();
  };

  return (
    <div
      className="absolute inset-0 cursor-grab overflow-hidden bg-black active:cursor-grabbing"
      role="application"
      aria-label={`${alt} Interactive 360-degree panorama. Drag or use arrow keys to look around; scroll to zoom.`}
      tabIndex={0}
      data-initial-yaw={PANORAMA_INITIAL_YAW_DEGREES}
      style={{ viewTransitionName: transitionName }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={onKeyDown}
    >
      <Image
        className="absolute inset-0 size-full object-cover transition-opacity duration-300 motion-reduce:transition-none"
        src={posterSrc}
        alt={alt}
        fill
        sizes="(max-width: 899px) calc(100vw - 44px), min(900px, 90vw)"
      />
      <div
        ref={mountRef}
        className="absolute inset-0 [&>canvas]:block [&>canvas]:size-full"
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/55 px-3 py-1.5 font-mono text-metadata font-medium tracking-widest text-white uppercase backdrop-blur-md">
        {interactive ? "DRAG TO LOOK AROUND" : "LOADING 360°"}
      </span>
    </div>
  );
}
