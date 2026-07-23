import * as THREE from "three";
import type {
  MetricContribution,
  MetricSource,
  ResourceCategory,
  ResourceConsumer,
} from "./types";

type ThreeInventory = {
  estimatedGeometryBytes: number;
  estimatedTextureBytes: number;
  estimatedShadowBytes: number;
  consumers: ResourceConsumer[];
};

type ImageDimensions = {
  width?: number;
  height?: number;
  depth?: number;
};

const textureTypeBytes = new Map<number, number>([
  [THREE.UnsignedByteType, 1],
  [THREE.ByteType, 1],
  [THREE.UnsignedShortType, 2],
  [THREE.ShortType, 2],
  [THREE.HalfFloatType, 2],
  [THREE.UnsignedIntType, 4],
  [THREE.IntType, 4],
  [THREE.FloatType, 4],
]);

const formatChannels = new Map<number, number>([
  [THREE.RedFormat, 1],
  [THREE.RGFormat, 2],
  [THREE.RGBFormat, 3],
  [THREE.RGBAFormat, 4],
  [THREE.DepthFormat, 1],
  [THREE.DepthStencilFormat, 1],
]);

function nearestName(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name) return current.name;
    current = current.parent;
  }
  return null;
}

function resourceLabel(
  resource: { name: string; uuid: string },
  resourceKind: string,
  owner: THREE.Object3D,
) {
  if (resource.name) return resource.name;
  const ownerName = nearestName(owner);
  return ownerName
    ? `${ownerName} ${resourceKind}`
    : `${resourceKind} ${resource.uuid.slice(0, 8)}`;
}

function textureKind(texture: THREE.Texture) {
  if (texture instanceof THREE.CubeTexture) return "CubeTexture";
  if (texture instanceof THREE.CompressedTexture) return "CompressedTexture";
  if (texture instanceof THREE.DataTexture) return "DataTexture";
  if (texture instanceof THREE.CanvasTexture) return "CanvasTexture";
  return "Texture";
}

function attributeArrays(geometry: THREE.BufferGeometry): ArrayBufferView[] {
  const arrays: ArrayBufferView[] = [];
  const add = (
    attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  ) => {
    arrays.push(
      attribute instanceof THREE.InterleavedBufferAttribute
        ? attribute.data.array
        : attribute.array,
    );
  };
  if (geometry.index) add(geometry.index);
  Object.values(geometry.attributes).forEach(add);
  Object.values(geometry.morphAttributes).forEach((attributes) =>
    attributes.forEach(add),
  );
  return arrays;
}

export function estimateGeometryBytes(geometry: THREE.BufferGeometry) {
  const buffers = new Set<ArrayBufferLike>();
  let bytes = 0;
  for (const array of attributeArrays(geometry)) {
    if (buffers.has(array.buffer)) continue;
    buffers.add(array.buffer);
    bytes += array.byteLength;
  }
  return bytes;
}

function textureDimensions(texture: THREE.Texture) {
  const textureImage = texture.image as
    | ImageDimensions
    | ImageDimensions[]
    | undefined;
  const image = Array.isArray(textureImage) ? textureImage[0] : textureImage;
  return {
    width: image?.width ?? 0,
    height: image?.height ?? 0,
    depth: image?.depth ?? 1,
    faces: Array.isArray(textureImage) ? textureImage.length : 1,
  };
}

export function estimateTextureBytes(texture: THREE.Texture) {
  if (texture instanceof THREE.CompressedTexture && texture.mipmaps.length) {
    return texture.mipmaps.reduce(
      (sum, mip) => sum + (mip.data?.byteLength ?? 0),
      0,
    );
  }
  const { width, height, depth, faces } = textureDimensions(texture);
  if (!width || !height) return 0;
  const channels = formatChannels.get(texture.format) ?? 4;
  const bytesPerChannel = textureTypeBytes.get(texture.type) ?? 1;
  const mipMultiplier = texture.generateMipmaps ? 4 / 3 : 1;
  return Math.round(
    width * height * depth * channels * bytesPerChannel * faces * mipMultiplier,
  );
}

function texturesFromMaterial(material: THREE.Material) {
  return Object.values(material).filter(
    (value): value is THREE.Texture => value instanceof THREE.Texture,
  );
}

function addConsumer(
  consumers: ResourceConsumer[],
  category: ResourceCategory,
  id: string,
  label: string,
  estimatedBytes: number,
) {
  consumers.push({ id, label, category, estimatedBytes });
}

export function inventoryThreeScene(scene: THREE.Scene): ThreeInventory {
  const geometries = new Set<THREE.BufferGeometry>();
  const textures = new Set<THREE.Texture>();
  const consumers: ResourceConsumer[] = [];
  let estimatedGeometryBytes = 0;
  let estimatedTextureBytes = 0;
  let estimatedShadowBytes = 0;

  scene.traverse((object) => {
    if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) {
      const geometry = object.geometry;
      if (!geometries.has(geometry)) {
        geometries.add(geometry);
        const estimatedBytes = estimateGeometryBytes(geometry);
        estimatedGeometryBytes += estimatedBytes;
        addConsumer(
          consumers,
          "geometry",
          geometry.uuid,
          resourceLabel(geometry, geometry.type, object),
          estimatedBytes,
        );
      }
    }

    if ("material" in object) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        if (!(material instanceof THREE.Material)) return;
        texturesFromMaterial(material).forEach((texture) => {
          if (textures.has(texture)) return;
          textures.add(texture);
          const estimatedBytes = estimateTextureBytes(texture);
          estimatedTextureBytes += estimatedBytes;
          addConsumer(
            consumers,
            "texture",
            texture.uuid,
            resourceLabel(texture, textureKind(texture), object),
            estimatedBytes,
          );
        });
      });
    }

    if (
      object instanceof THREE.Light &&
      object.castShadow &&
      "shadow" in object
    ) {
      const shadow = object.shadow as THREE.LightShadow<THREE.Camera>;
      const faces = object instanceof THREE.PointLight ? 6 : 1;
      const estimatedBytes =
        shadow.mapSize.width * shadow.mapSize.height * faces * 8;
      estimatedShadowBytes += estimatedBytes;
      addConsumer(
        consumers,
        "shadow-map",
        `${object.uuid}:shadow`,
        object.name || `${object.type} shadow ${object.uuid.slice(0, 8)}`,
        estimatedBytes,
      );
    }
  });

  consumers.sort((a, b) => b.estimatedBytes - a.estimatedBytes);
  return {
    estimatedGeometryBytes,
    estimatedTextureBytes,
    estimatedShadowBytes,
    consumers,
  };
}

export function createThreeMetricsSource(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
): MetricSource {
  let lastInventoryAt = Number.NEGATIVE_INFINITY;
  let inventory: ThreeInventory | null = null;
  return {
    id: "three",
    intervalMs: 500,
    sample: ({ now }): MetricContribution => {
      if (inventory == null || now - lastInventoryAt >= 2000) {
        inventory = inventoryThreeScene(scene);
        lastInventoryAt = now;
      }
      const estimatedGpuBytes =
        inventory.estimatedGeometryBytes +
        inventory.estimatedTextureBytes +
        inventory.estimatedShadowBytes;
      return {
        render: {
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          points: renderer.info.render.points,
          lines: renderer.info.render.lines,
          programs: renderer.info.programs?.length ?? null,
        },
        resources: {
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
        },
        memory: {
          estimatedGeometryBytes: inventory.estimatedGeometryBytes,
          estimatedTextureBytes: inventory.estimatedTextureBytes,
          estimatedShadowBytes: inventory.estimatedShadowBytes,
          estimatedGpuBytes,
        },
        capabilities: {
          maxTextureSize: renderer.capabilities.maxTextureSize,
          maxCubemapSize: renderer.capabilities.maxCubemapSize,
          maxTextures: renderer.capabilities.maxTextures,
          maxVertexTextures: renderer.capabilities.maxVertexTextures,
          maxAttributes: renderer.capabilities.maxAttributes,
          maxSamples: renderer.capabilities.maxSamples,
        },
        consumers: inventory.consumers,
      };
    },
  };
}
