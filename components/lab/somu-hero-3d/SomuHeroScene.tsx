"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SomuPointerTarget } from "./SomuHero3D";

type SceneProps = {
  reduced: boolean;
  target: SomuPointerTarget;
};

function seededNoise(index: number) {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function canvasTexture(draw: (context: CanvasRenderingContext2D, size: number) => void) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) draw(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeRoom(scene: THREE.Scene) {
  const plaster = canvasTexture((context, size) => {
    context.fillStyle = "#cfc6b3";
    context.fillRect(0, 0, size, size);
    for (let i = 0; i < 1800; i += 1) {
      context.fillStyle = `rgba(80,70,55,${seededNoise(i) * 0.08})`;
      context.fillRect(seededNoise(i + 1) * size, seededNoise(i + 2) * size, seededNoise(i + 3) * 3, seededNoise(i + 4) * 3);
    }
  });
  plaster.repeat.set(2.2, 1.4);

  const floorTexture = canvasTexture((context, size) => {
    context.fillStyle = "#a59b87";
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 64) {
      context.fillStyle = y % 128 === 0 ? "#968c79" : "#b1a691";
      context.fillRect(0, y, size, 2);
    }
    for (let i = 0; i < 1200; i += 1) {
      context.fillStyle = `rgba(45,37,28,${seededNoise(i + 5000) * 0.06})`;
      context.fillRect(seededNoise(i + 5001) * size, seededNoise(i + 5002) * size, seededNoise(i + 5003) * 12, 1);
    }
  });
  floorTexture.repeat.set(3, 2);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(7, 4.2), new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.92, color: "#d0c6b3" }));
  wall.position.set(0, 0.95, -2.2);
  wall.receiveShadow = true;
  scene.add(wall);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(7, 5.2), new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.88, color: "#b7ac97" }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.05, 0.1);
  floor.receiveShadow = true;
  scene.add(floor);

  return [plaster, floorTexture];
}

function makeStillLife() {
  const group = new THREE.Group();
  group.position.set(-1.35, -0.6, -0.58);
  group.rotation.set(0.04, -0.15, 0.02);

  const stoneMaterial = new THREE.MeshStandardMaterial({ color: "#918879", roughness: 0.96 });
  const mainStone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 2), stoneMaterial);
  mainStone.position.set(0.12, 0.2, 0);
  mainStone.rotation.set(0.05, 0.2, -0.16);
  mainStone.castShadow = true;
  mainStone.receiveShadow = true;
  group.add(mainStone);

  const lowerStone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 2), new THREE.MeshStandardMaterial({ color: "#b7ad99", roughness: 0.94 }));
  lowerStone.position.set(-0.28, -0.28, 0.08);
  lowerStone.rotation.set(0.2, -0.4, 0.24);
  lowerStone.castShadow = true;
  lowerStone.receiveShadow = true;
  group.add(lowerStone);

  const leafMaterial = new THREE.MeshStandardMaterial({ color: "#556033", roughness: 0.75, metalness: 0.02 });
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    const radius = 0.58 + (index % 3) * 0.11;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), leafMaterial);
    leaf.position.set(Math.cos(angle) * radius, 0.38 + Math.sin(index) * 0.12, Math.sin(angle) * 0.25);
    leaf.rotation.set(0.9, angle, Math.sin(index) * 0.35);
    leaf.castShadow = true;
    group.add(leaf);
  }

  return group;
}

export default function SomuHeroScene({ reduced, target }: SceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#c9c2b3");
    const camera = new THREE.PerspectiveCamera(36, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0.12, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    const textures = makeRoom(scene);
    const stillLife = makeStillLife();
    scene.add(stillLife);
    scene.add(new THREE.AmbientLight("#fff8ea", 0.9));
    const spot = new THREE.SpotLight("#fff0cf", 3.5, 8, 0.42, 0.9);
    spot.position.set(1.2, 2.7, 1.4);
    spot.castShadow = true;
    scene.add(spot);
    const fill = new THREE.DirectionalLight("#d7ccb8", 0.7);
    fill.position.set(-2, 1.8, 1.2);
    scene.add(fill);

    let frame = 0;
    let animationId = 0;
    const root = new THREE.Group();
    while (scene.children.length) root.add(scene.children[0]);
    scene.add(root);

    const resize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };

    const animate = () => {
      frame += 1;
      if (!reduced) {
        root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, target.current.x * 0.08, 0.06);
        root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, target.current.y * -0.05, 0.06);
        stillLife.position.y = -0.6 + Math.sin(frame * 0.018) * 0.03;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.current.x * 0.26, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.12 + target.current.y * -0.14, 0.05);
      }
      camera.lookAt(0, -0.08, -1.25);
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationId);
      host.removeChild(renderer.domElement);
      renderer.dispose();
      textures.forEach((texture) => texture.dispose());
    };
  }, [reduced, target]);

  return <div ref={hostRef} className="absolute inset-0 z-[2]" aria-hidden="true" />;
}
