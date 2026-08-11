"use client";

import { useMediaQuery } from "@/components/landing/use-media-query";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { Minimize2Icon, OrbitIcon } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type DeviceOrientationPermission = {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
};

type PanoramaApi = {
  setGyroscope: (enabled: boolean) => void;
};

type PanoramaViewerProps = {
  src: string;
  posterSrc: string;
  alt: string;
  transitionName?: string;
  onInteractive?: () => void;
};

export const PANORAMA_INITIAL_YAW_DEGREES = 180;
/** Velocity retained per 60fps frame after the drag is released. */
export const PANORAMA_FRICTION = 0.94;
/** Below this (degrees per frame) the spin is done and the ticker stops. */
export const PANORAMA_MIN_VELOCITY = 0.015;
const FRAME_MS = 1000 / 60;
const MIN_FOV = 42;
const MAX_FOV = 90;
const MAX_PITCH = 80;

export function createPanoramaControls() {
  return { yaw: PANORAMA_INITIAL_YAW_DEGREES, pitch: 0, fov: 72 };
}

/**
 * Frame-rate independent friction: the same real-time decay whether the
 * display runs at 60Hz or 120Hz. Snaps to 0 once the spin is imperceptible.
 */
export function dampPanoramaVelocity(velocity: number, deltaMs: number): number {
  const damped = velocity * PANORAMA_FRICTION ** (deltaMs / FRAME_MS);
  return Math.abs(damped) < PANORAMA_MIN_VELOCITY ? 0 : damped;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

/** Shortest signed way round the circle, so 359° → 1° turns +2, not -358. */
export function shortestYawDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

export default function PanoramaViewer({
  src,
  posterSrc,
  alt,
  transitionName,
  onInteractive,
}: PanoramaViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef(createPanoramaControls());
  const renderRef = useRef<(() => void) | null>(null);
  const apiRef = useRef<PanoramaApi | null>(null);
  const [interactive, setInteractive] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [gyroDenied, setGyroDenied] = useState(false);
  // Handheld only: a gyroscope button on a laptop is dead weight.
  const gyroAvailable =
    useMediaQuery("(pointer: coarse)") &&
    typeof window !== "undefined" &&
    "DeviceOrientationEvent" in window;

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

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const controls = controlsRef.current;
      const velocity = { yaw: 0, pitch: 0 };
      // Live pointers, so a second finger becomes a pinch instead of a jump.
      const pointers = new Map<number, { x: number; y: number }>();
      let fovTarget = controls.fov;
      let pinchDistance = 0;
      let dragging = false;
      let lastMoveAt = 0;
      let ticking = false;

      // Gyroscope state. `yawOffset` lets a drag re-aim the panorama while the
      // device keeps steering, the way Google Photos mixes the two.
      const gyroTarget = { yaw: controls.yaw, pitch: 0 };
      const deviceEuler = new THREE.Euler();
      const deviceQuaternion = new THREE.Quaternion();
      const screenQuaternion = new THREE.Quaternion();
      const forward = new THREE.Vector3();
      // -90° about x: device frame (screen up = +z) → three's camera frame.
      const frameCorrection = new THREE.Quaternion(
        -Math.SQRT1_2,
        0,
        0,
        Math.SQRT1_2,
      );
      const screenAxis = new THREE.Vector3(0, 0, 1);
      let gyroActive = false;
      let gyroCalibrated = false;
      let gyroReading: DeviceOrientationEvent | null = null;
      let yawOffset = 0;

      const screenAngle = () =>
        THREE.MathUtils.degToRad(window.screen?.orientation?.angle ?? 0);

      const readGyroTarget = (event: DeviceOrientationEvent) => {
        const alpha = THREE.MathUtils.degToRad(event.alpha ?? 0);
        const beta = THREE.MathUtils.degToRad(event.beta ?? 0);
        const gamma = THREE.MathUtils.degToRad(event.gamma ?? 0);

        deviceEuler.set(beta, alpha, -gamma, "YXZ");
        deviceQuaternion.setFromEuler(deviceEuler);
        deviceQuaternion.multiply(frameCorrection);
        deviceQuaternion.multiply(
          screenQuaternion.setFromAxisAngle(screenAxis, -screenAngle()),
        );

        // Where the phone is pointing, converted back into our yaw/pitch pair.
        forward.set(0, 0, -1).applyQuaternion(deviceQuaternion);
        const rawYaw = THREE.MathUtils.radToDeg(
          Math.atan2(forward.z, forward.x),
        );
        if (!gyroCalibrated) {
          // First reading defines north as wherever the viewer already looks,
          // so switching modes doesn't whip the camera across the sphere.
          yawOffset = controls.yaw - rawYaw;
          gyroCalibrated = true;
        }
        gyroTarget.yaw = rawYaw + yawOffset;
        gyroTarget.pitch = clamp(
          THREE.MathUtils.radToDeg(Math.asin(clamp(forward.y, -1, 1))),
          -MAX_PITCH,
          MAX_PITCH,
        );
      };

      const onDeviceOrientation = (event: DeviceOrientationEvent) => {
        gyroReading = event;
        readGyroTarget(event);
      };

      /** Degrees per pixel. Zoomed in tracks slower, so aim stays precise. */
      const sensitivity = () => controls.fov / 600;

      const settled = () =>
        !dragging &&
        !gyroActive &&
        velocity.yaw === 0 &&
        velocity.pitch === 0 &&
        Math.abs(fovTarget - controls.fov) < 0.02;

      const tick = (_time: number, deltaMs: number) => {
        // Cap dt so a backgrounded tab doesn't fling the camera on return.
        const dt = Math.min(deltaMs, 64);

        if (gyroActive) {
          if (gyroReading) {
            // Ease toward the device pose, because raw sensor frames are jittery.
            const follow = 1 - Math.exp(-dt / 70);
            controls.yaw += shortestYawDelta(controls.yaw, gyroTarget.yaw) * follow;
            controls.pitch += (gyroTarget.pitch - controls.pitch) * follow;
          }
        } else if (!dragging) {
          const frames = dt / FRAME_MS;
          controls.yaw += velocity.yaw * frames;
          const nextPitch = controls.pitch + velocity.pitch * frames;
          controls.pitch = clamp(nextPitch, -MAX_PITCH, MAX_PITCH);
          if (controls.pitch !== nextPitch) velocity.pitch = 0;
          velocity.yaw = dampPanoramaVelocity(velocity.yaw, dt);
          velocity.pitch = dampPanoramaVelocity(velocity.pitch, dt);
        }

        const fovGap = fovTarget - controls.fov;
        controls.fov =
          Math.abs(fovGap) < 0.02
            ? fovTarget
            : controls.fov + fovGap * (1 - Math.exp(-dt / 90));

        render();
        if (settled()) stopTicker();
      };

      const startTicker = () => {
        if (ticking) return;
        ticking = true;
        gsap.ticker.add(tick);
      };
      const stopTicker = () => {
        if (!ticking) return;
        ticking = false;
        gsap.ticker.remove(tick);
      };

      const pinchSpan = () => {
        const [first, second] = [...pointers.values()];
        if (!first || !second) return 0;
        return Math.hypot(first.x - second.x, first.y - second.y);
      };

      const onPointerDown = (event: PointerEvent) => {
        // Keep the gallery's swipe-to-navigate out of the panorama.
        event.stopPropagation();
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        renderer.domElement.setPointerCapture(event.pointerId);
        velocity.yaw = 0;
        velocity.pitch = 0;
        lastMoveAt = event.timeStamp;
        if (pointers.size >= 2) {
          dragging = false;
          pinchDistance = pinchSpan();
        } else {
          dragging = true;
        }
        startTicker();
      };

      const onPointerMove = (event: PointerEvent) => {
        const previous = pointers.get(event.pointerId);
        if (!previous) return;
        event.stopPropagation();
        const deltaX = event.clientX - previous.x;
        const deltaY = event.clientY - previous.y;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pointers.size >= 2) {
          const span = pinchSpan();
          if (pinchDistance > 0 && span > 0) {
            fovTarget = clamp(
              fovTarget * (pinchDistance / span),
              MIN_FOV,
              MAX_FOV,
            );
          }
          pinchDistance = span;
          startTicker();
          return;
        }

        if (!dragging) return;
        const degreesPerPixel = sensitivity();
        const yawDelta = -deltaX * degreesPerPixel;
        const pitchDelta = deltaY * degreesPerPixel;

        if (gyroActive) {
          // The device owns the pose; a drag only re-aims where north sits.
          yawOffset += yawDelta;
          gyroTarget.yaw += yawDelta;
          lastMoveAt = event.timeStamp;
          startTicker();
          return;
        }

        controls.yaw += yawDelta;
        const nextPitch = controls.pitch + pitchDelta;
        controls.pitch = clamp(nextPitch, -MAX_PITCH, MAX_PITCH);

        if (!reducedMotion) {
          // Normalise to a 60fps frame, then blend so one stuttery event
          // can't dominate the throw.
          const elapsed = Math.max(event.timeStamp - lastMoveAt, 8);
          const scale = FRAME_MS / elapsed;
          velocity.yaw = velocity.yaw * 0.35 + yawDelta * scale * 0.65;
          velocity.pitch =
            controls.pitch === nextPitch
              ? velocity.pitch * 0.35 + pitchDelta * scale * 0.65
              : 0;
        }
        lastMoveAt = event.timeStamp;
        startTicker();
      };

      const onPointerUp = (event: PointerEvent) => {
        if (!pointers.delete(event.pointerId)) return;
        if (renderer.domElement.hasPointerCapture(event.pointerId)) {
          renderer.domElement.releasePointerCapture(event.pointerId);
        }
        if (pointers.size < 2) pinchDistance = 0;
        // A finger lifted more than 100ms ago was a hold, not a throw.
        if (event.timeStamp - lastMoveAt > 100) {
          velocity.yaw = 0;
          velocity.pitch = 0;
        }
        dragging = pointers.size === 1;
        if (dragging) lastMoveAt = event.timeStamp;
        startTicker();
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        fovTarget = clamp(fovTarget + event.deltaY * 0.025, MIN_FOV, MAX_FOV);
        if (reducedMotion) controls.fov = fovTarget;
        startTicker();
      };

      const canvas = renderer.domElement;
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });

      apiRef.current = {
        setGyroscope: (enabled) => {
          if (enabled === gyroActive) return;
          gyroActive = enabled;
          if (enabled) {
            velocity.yaw = 0;
            velocity.pitch = 0;
            yawOffset = 0;
            gyroCalibrated = false;
            gyroReading = null;
            gyroTarget.yaw = controls.yaw;
            gyroTarget.pitch = controls.pitch;
            window.addEventListener("deviceorientation", onDeviceOrientation);
            startTicker();
            return;
          }
          window.removeEventListener("deviceorientation", onDeviceOrientation);
          gyroReading = null;
        },
      };

      cleanup = () => {
        renderRef.current = null;
        apiRef.current = null;
        window.removeEventListener("deviceorientation", onDeviceOrientation);
        stopTicker();
        resizeObserver.disconnect();
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("wheel", onWheel);
        material.map?.dispose();
        material.dispose();
        geometry.dispose();
        renderer.dispose();
        canvas.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [onInteractive, src]);

  const exitImmersive = useCallback(() => {
    apiRef.current?.setGyroscope(false);
    setImmersive(false);
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    if (!immersive) return;

    // Native fullscreen can be dismissed by the OS chrome or a gesture.
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) exitImmersive();
    };
    // Take Escape before the gallery does, so it leaves the panorama first.
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      exitImmersive();
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onEscape, true);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onEscape, true);
    };
  }, [exitImmersive, immersive]);

  useEffect(() => exitImmersive, [exitImmersive]);

  const enterImmersive = useCallback(async () => {
    const deviceOrientation =
      window.DeviceOrientationEvent as unknown as DeviceOrientationPermission;

    // iOS 13+ only hands over motion data from inside a user gesture.
    if (typeof deviceOrientation?.requestPermission === "function") {
      try {
        const decision = await deviceOrientation.requestPermission();
        if (decision !== "granted") {
          setGyroDenied(true);
          return;
        }
      } catch {
        setGyroDenied(true);
        return;
      }
    }

    setGyroDenied(false);
    setImmersive(true);
    apiRef.current?.setGyroscope(true);
    // iPhone Safari has no Element.requestFullscreen; the fixed-inset layout
    // below is the real fullscreen there, native is a bonus where it exists.
    if (rootRef.current?.requestFullscreen) {
      try {
        await rootRef.current.requestFullscreen({ navigationUI: "hide" });
      } catch {
        // Staying in the CSS overlay is a fine outcome.
      }
    }
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const controls = controlsRef.current;
    if (event.key === "ArrowLeft") controls.yaw -= 5;
    else if (event.key === "ArrowRight") controls.yaw += 5;
    else if (event.key === "ArrowUp")
      controls.pitch = Math.min(MAX_PITCH, controls.pitch + 5);
    else if (event.key === "ArrowDown")
      controls.pitch = Math.max(-MAX_PITCH, controls.pitch - 5);
    else return;
    event.preventDefault();
    event.stopPropagation();
    renderRef.current?.();
  };

  return (
    // role="application" with tabIndex and a full arrow-key handler is the
    // intended pattern for a viewport you look around inside; jsx-a11y does not
    // treat "application" as interactive, so the generic rules misfire here.
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    <div
      ref={rootRef}
      // touch-none hands every finger to the canvas: without it the browser
      // claims vertical drags for scrolling and cancels the pan mid-gesture.
      className={cn(
        "cursor-grab touch-none overflow-hidden bg-black select-none active:cursor-grabbing",
        immersive ? "fixed inset-0 z-100" : "absolute inset-0",
      )}
      role="application"
      data-panorama
      data-immersive={immersive || undefined}
      aria-label={`${alt} Interactive 360-degree panorama. Drag or use arrow keys to look around; scroll or pinch to zoom.`}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the viewer is the control
      tabIndex={0}
      data-initial-yaw={PANORAMA_INITIAL_YAW_DEGREES}
      style={{ viewTransitionName: immersive ? undefined : transitionName }}
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
      {gyroAvailable && interactive && (
        <button
          type="button"
          className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
          aria-pressed={immersive}
          aria-label={
            immersive
              ? "Exit fullscreen 360 view"
              : "View fullscreen and look around by moving your phone"
          }
          onClick={() => {
            if (immersive) exitImmersive();
            else void enterImmersive();
          }}
        >
          {immersive ? (
            <Minimize2Icon className="size-5" aria-hidden />
          ) : (
            <OrbitIcon className="size-5" aria-hidden />
          )}
        </button>
      )}
      <span
        className={cn(
          "pointer-events-none absolute rounded-full bg-black/55 px-3 py-1.5 font-mono text-metadata font-medium tracking-widest text-white uppercase backdrop-blur-md",
          immersive
            ? "bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2"
            : "right-3 bottom-3",
        )}
        role={gyroDenied ? "status" : undefined}
      >
        {!interactive
          ? "LOADING 360°"
          : gyroDenied
            ? "MOTION ACCESS BLOCKED"
            : immersive
              ? "MOVE YOUR PHONE TO LOOK"
              : null}
        {interactive && !gyroDenied && !immersive && (
          <>
            <span className="max-[899px]:hidden">DRAG TO LOOK AROUND</span>
            <span className="hidden max-[899px]:inline">
              DRAG · PINCH TO ZOOM
            </span>
          </>
        )}
      </span>
    </div>
  );
}
