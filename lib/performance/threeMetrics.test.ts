import { describe, expect, test } from "bun:test";
import * as THREE from "three";
import {
  createThreeMetricsSource,
  estimateGeometryBytes,
  estimateTextureBytes,
  inventoryThreeScene,
} from "./threeMetrics";

describe("Three.js memory estimates", () => {
  test("counts shared geometry buffers and textures once", () => {
    const scene = new THREE.Scene();
    const geometry = new THREE.BufferGeometry();
    geometry.name = "Shared quad";
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(12), 3),
    );
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(6), 1));
    const texture = new THREE.DataTexture(new Uint8Array(4 * 4 * 4), 4, 4);
    texture.name = "Shared albedo";
    texture.generateMipmaps = false;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const first = new THREE.Mesh(geometry, material);
    first.name = "First quad";
    const second = new THREE.Mesh(geometry, material);
    second.name = "Second quad";
    scene.add(first, second);

    const inventory = inventoryThreeScene(scene);

    expect(estimateGeometryBytes(geometry)).toBe(60);
    expect(estimateTextureBytes(texture)).toBe(64);
    expect(inventory.estimatedGeometryBytes).toBe(60);
    expect(inventory.estimatedTextureBytes).toBe(64);
    expect(inventory.consumers).toHaveLength(2);
  });

  test("deduplicates shared interleaved attribute storage", () => {
    const geometry = new THREE.BufferGeometry();
    const buffer = new THREE.InterleavedBuffer(new Float32Array(20), 5);
    geometry.setAttribute(
      "position",
      new THREE.InterleavedBufferAttribute(buffer, 3, 0),
    );
    geometry.setAttribute(
      "uv",
      new THREE.InterleavedBufferAttribute(buffer, 2, 3),
    );

    expect(estimateGeometryBytes(geometry)).toBe(80);
  });

  test("accounts for all six cube-texture faces", () => {
    const faces = Array.from(
      { length: 6 },
      () => ({ width: 8, height: 8 }) as TexImageSource,
    );
    const texture = new THREE.CubeTexture(faces);
    texture.format = THREE.RGBAFormat;
    texture.type = THREE.UnsignedByteType;
    texture.generateMipmaps = false;

    expect(estimateTextureBytes(texture)).toBe(8 * 8 * 4 * 6);
  });

  test("sorts named geometry, texture, and shadow consumers by size", () => {
    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.name = "Boulder geometry";
    const texture = new THREE.DataTexture(
      new Uint8Array(32 * 32 * 4),
      32,
      32,
    );
    texture.name = "Plaster texture";
    texture.generateMipmaps = false;
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    mesh.name = "Boulder";
    const light = new THREE.DirectionalLight();
    light.name = "Top key shadow";
    light.castShadow = true;
    light.shadow.mapSize.set(64, 64);
    scene.add(mesh, light);

    const inventory = inventoryThreeScene(scene);

    expect(inventory.estimatedShadowBytes).toBe(64 * 64 * 8);
    expect(inventory.consumers[0].label).toBe("Top key shadow");
    expect(inventory.consumers.map((item) => item.category)).toContain(
      "texture",
    );
  });

  test("uses type and shortened UUID when no name exists", () => {
    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
    scene.add(mesh);

    const inventory = inventoryThreeScene(scene);
    expect(inventory.consumers[0].label).toContain(geometry.type);
    expect(inventory.consumers[0].label).toContain(geometry.uuid.slice(0, 8));
  });

  test("uses the nearest named owner for an unnamed resource", () => {
    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
    mesh.name = "Portfolio boulder";
    scene.add(mesh);

    const inventory = inventoryThreeScene(scene);
    expect(inventory.consumers[0].label).toBe(
      `Portfolio boulder ${geometry.type}`,
    );
  });

  test("uses a texture kind and UUID when a texture and owner are unnamed", () => {
    const scene = new THREE.Scene();
    const texture = new THREE.DataTexture(new Uint8Array(16), 2, 2);
    texture.generateMipmaps = false;
    scene.add(
      new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial({ map: texture }),
      ),
    );

    const textureConsumer = inventoryThreeScene(scene).consumers.find(
      (consumer) => consumer.category === "texture",
    );
    expect(textureConsumer?.label).toContain("DataTexture");
    expect(textureConsumer?.label).toContain(texture.uuid.slice(0, 8));
  });

  test("reuses inventory between two-second scans", () => {
    const scene = new THREE.Scene();
    const renderer = {
      info: {
        render: { calls: 1, triangles: 2, points: 0, lines: 0 },
        memory: { geometries: 0, textures: 0 },
        programs: [],
      },
      capabilities: {
        maxTextureSize: 4096,
        maxCubemapSize: 4096,
        maxTextures: 16,
        maxVertexTextures: 16,
        maxAttributes: 16,
        maxSamples: 4,
      },
    } as unknown as THREE.WebGLRenderer;
    const source = createThreeMetricsSource(renderer, scene);

    expect(source.sample({ now: 0 }).consumers).toHaveLength(0);
    scene.add(
      new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()),
    );
    expect(source.sample({ now: 500 }).consumers).toHaveLength(0);
    expect(source.sample({ now: 2000 }).consumers).toHaveLength(1);
  });
});
