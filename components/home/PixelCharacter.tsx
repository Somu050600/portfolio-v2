import type { ReactNode, Ref } from "react";
import {
  getTwoLegPose,
  PIXEL_CHARACTERS,
  type PixelCharacterId,
  type Vec2,
} from "./pixel-characters";

type CurrentPixelRendererProps = {
  preview?: boolean;
  bodyRef?: Ref<HTMLDivElement>;
  leftEyeRef?: Ref<HTMLSpanElement>;
  rightEyeRef?: Ref<HTMLSpanElement>;
};

function CurrentPixelBody({
  bodyRef,
  leftEyeRef,
  rightEyeRef,
}: Omit<CurrentPixelRendererProps, "preview">) {
  return (
    <div
      ref={bodyRef}
      data-pixel-body
      className="absolute bottom-0 left-0 h-11 w-15.5 origin-bottom overflow-hidden rounded-[21px_21px_13px_13px] border border-thumb-border bg-[linear-gradient(170deg,color-mix(in_srgb,var(--thumb-bg)_78%,white),var(--thumb-bg))] shadow-md will-change-transform"
    >
      <span
        ref={leftEyeRef}
        data-pixel-eye="left"
        className="absolute bottom-5.5 left-4.75 h-2 w-1.5 rounded-[3px] bg-accent transition-transform duration-180 ease-out will-change-transform"
      />
      <span
        ref={rightEyeRef}
        data-pixel-eye="right"
        className="absolute bottom-5.5 left-9.25 h-2 w-1.5 rounded-[3px] bg-accent transition-transform duration-180 ease-out will-change-transform"
      />
    </div>
  );
}

export function CurrentPixelRenderer({
  preview = false,
  bodyRef,
  leftEyeRef,
  rightEyeRef,
}: CurrentPixelRendererProps) {
  if (preview) {
    return (
      <div
        data-pixel-current-renderer
        data-pixel-current-preview
        aria-hidden
        className="relative h-8 w-10 shrink-0 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 h-11 w-15.5 origin-center -translate-x-1/2 -translate-y-1/2 scale-50">
          <CurrentPixelBody />
        </div>
      </div>
    );
  }

  return (
    <div
      data-pixel-current-renderer
      className="absolute inset-0"
    >
      <CurrentPixelBody
        bodyRef={bodyRef}
        leftEyeRef={leftEyeRef}
        rightEyeRef={rightEyeRef}
      />
    </div>
  );
}

type ArticulatedLegsProps = {
  leftHip: Vec2;
  rightHip: Vec2;
  legLength: number;
  stroke: string;
  strokeWidth?: number;
};

function legPath(hip: Vec2, knee: Vec2, foot: Vec2) {
  return `M ${hip.x} ${hip.y} L ${knee.x} ${knee.y} L ${foot.x} ${foot.y}`;
}

function ArticulatedLegs({
  leftHip,
  rightHip,
  legLength,
  stroke,
  strokeWidth = 2.8,
}: ArticulatedLegsProps) {
  const left = getTwoLegPose({
    phase: 0,
    side: 0,
    hip: leftHip,
    legLength,
  });
  const right = getTwoLegPose({
    phase: 0,
    side: 1,
    hip: rightHip,
    legLength,
  });

  return (
    <g
      fill="none"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      <path
        data-pixel-leg="left"
        data-gait-side="0"
        data-hip-x={leftHip.x}
        data-hip-y={leftHip.y}
        data-leg-length={legLength}
        d={legPath(left.hip, left.knee, left.foot)}
      />
      <path
        data-pixel-leg="right"
        data-gait-side="1"
        data-hip-x={rightHip.x}
        data-hip-y={rightHip.y}
        data-leg-length={legLength}
        d={legPath(right.hip, right.knee, right.foot)}
      />
    </g>
  );
}

type QuadrupedLegsProps = {
  layer: "far" | "near";
  rearHip: Vec2;
  frontHip: Vec2;
  legLength: number;
  stroke: string;
  strokeWidth?: number;
};

function QuadrupedLegs({
  layer,
  rearHip,
  frontHip,
  legLength,
  stroke,
  strokeWidth = 2.8,
}: QuadrupedLegsProps) {
  const far = layer === "far";
  const rearSide = far ? 0 : 1;
  const frontSide = far ? 1 : 0;
  const rear = getTwoLegPose({
    phase: 0,
    side: rearSide,
    hip: rearHip,
    legLength,
  });
  const front = getTwoLegPose({
    phase: 0,
    side: frontSide,
    hip: frontHip,
    legLength,
  });

  return (
    <g
      data-pixel-leg-layer={layer}
      fill="none"
      opacity={far ? 0.55 : 1}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      <path
        data-pixel-leg={`${layer}-rear`}
        data-gait-side={rearSide}
        data-hip-x={rearHip.x}
        data-hip-y={rearHip.y}
        data-leg-length={legLength}
        d={legPath(rear.hip, rear.knee, rear.foot)}
      />
      <path
        data-pixel-leg={`${layer}-front`}
        data-gait-side={frontSide}
        data-hip-x={frontHip.x}
        data-hip-y={frontHip.y}
        data-leg-length={legLength}
        d={legPath(front.hip, front.knee, front.foot)}
      />
    </g>
  );
}

function TrackableEye({
  side,
  cx,
  cy,
  r,
  fill,
}: {
  side: "left" | "right";
  cx: number;
  cy: number;
  r: number;
  fill: string;
}) {
  return (
    <circle
      data-pixel-eye={side}
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      className="will-change-transform"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

function CharacterSvg({
  children,
  profile,
}: {
  children: ReactNode;
  profile?: "side";
}) {
  return (
    <div
      data-pixel-body
      data-pixel-profile={profile}
      className="absolute inset-0 origin-bottom will-change-transform"
    >
      <svg
        viewBox="0 0 62 46"
        className="h-full w-full overflow-visible drop-shadow-sm"
        aria-hidden
      >
        {children}
      </svg>
    </div>
  );
}

function DogRenderer() {
  return (
    <CharacterSvg profile="side">
      <QuadrupedLegs
        layer="far"
        rearHip={{ x: 21, y: 34 }}
        frontHip={{ x: 40, y: 34 }}
        legLength={8}
        stroke="#765a43"
      />
      <path d="M13 28 L2 20 L15 22 Z" fill="#765a43" />
      <ellipse cx="29" cy="27" rx="18" ry="11" fill="#bc9569" />
      <circle cx="46" cy="19" r="10.5" fill="#8a6b4f" />
      <path d="M40 13 L42 3 L49 10 Z" fill="#765a43" />
      <ellipse cx="53" cy="23" rx="7" ry="5" fill="#e3cda8" />
      <circle cx="59" cy="22" r="2.2" fill="#25211f" />
      <circle cx="48" cy="16" r="3" fill="#f4efe3" />
      <TrackableEye side="right" cx={48} cy={16} r={1.45} fill="#25211f" />
      <QuadrupedLegs
        layer="near"
        rearHip={{ x: 23, y: 35 }}
        frontHip={{ x: 42, y: 35 }}
        legLength={8}
        stroke="#765a43"
      />
    </CharacterSvg>
  );
}

function SparrowRenderer() {
  return (
    <CharacterSvg>
      <ArticulatedLegs
        leftHip={{ x: 27, y: 35 }}
        rightHip={{ x: 37, y: 35 }}
        legLength={8}
        stroke="#c78d28"
        strokeWidth={2.4}
      />
      <path d="M15 27 L3 21 L12 33 Z" fill="#765a43" />
      <ellipse cx="30" cy="27" rx="20" ry="11" fill="#bc9569" />
      <path d="M17 26 L29 19 L39 27 L27 34 Z" fill="#765a43" />
      <circle cx="42" cy="17" r="10" fill="#765a43" />
      <path d="M50 16 L61 20 L50 22 Z" fill="#d99628" />
      <circle cx="38.5" cy="14" r="3" fill="#f4efe3" />
      <circle cx="45.5" cy="14" r="3" fill="#f4efe3" />
      <TrackableEye side="left" cx={38.5} cy={14} r={1.35} fill="#25211f" />
      <TrackableEye side="right" cx={45.5} cy={14} r={1.35} fill="#25211f" />
    </CharacterSvg>
  );
}

function CatRenderer() {
  return (
    <CharacterSvg profile="side">
      <QuadrupedLegs
        layer="far"
        rearHip={{ x: 21, y: 35 }}
        frontHip={{ x: 40, y: 35 }}
        legLength={7.5}
        stroke="#3b3e46"
      />
      <path
        d="M14 28 C5 27 4 18 10 12"
        fill="none"
        stroke="#282b32"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <ellipse cx="29" cy="28" rx="18" ry="11" fill="#282b32" />
      <circle cx="46" cy="19" r="10.5" fill="#282b32" />
      <path d="M39 13 L41 3 L47 10 Z" fill="#282b32" />
      <path d="M47 10 L54 4 L53 14 Z" fill="#282b32" />
      <ellipse cx="53" cy="23" rx="6.5" ry="4.5" fill="#3b3e46" />
      <path d="M56 21 L59 22.5 L56 24 Z" fill="#777b86" />
      <rect x="45" y="14" width="6" height="6" rx="1" fill="#e5dcff" />
      <TrackableEye side="right" cx={48} cy={17} r={1.6} fill="#4a3a67" />
      <QuadrupedLegs
        layer="near"
        rearHip={{ x: 23, y: 36 }}
        frontHip={{ x: 42, y: 36 }}
        legLength={7.5}
        stroke="#282b32"
      />
    </CharacterSvg>
  );
}

function PenguinRenderer() {
  return (
    <CharacterSvg>
      <ArticulatedLegs
        leftHip={{ x: 25, y: 37 }}
        rightHip={{ x: 37, y: 37 }}
        legLength={7}
        stroke="#d99628"
      />
      <path d="M18 24 L6 34 L20 31 Z" fill="#282b32" />
      <path d="M44 24 L56 34 L42 31 Z" fill="#282b32" />
      <ellipse cx="31" cy="25" rx="17" ry="20" fill="#282b32" />
      <ellipse cx="31" cy="29" rx="11" ry="14" fill="#eee7d8" />
      <circle cx="25" cy="14" r="3.4" fill="#eee7d8" />
      <circle cx="37" cy="14" r="3.4" fill="#eee7d8" />
      <TrackableEye side="left" cx={25} cy={14} r={1.45} fill="#4a3a67" />
      <TrackableEye side="right" cx={37} cy={14} r={1.45} fill="#4a3a67" />
      <path
        data-pixel-beak="centered"
        d="M27 20 L31 24 L35 20 L31 18 Z"
        fill="#d99628"
      />
    </CharacterSvg>
  );
}

function FrogRenderer() {
  return (
    <CharacterSvg>
      <ArticulatedLegs
        leftHip={{ x: 23, y: 36 }}
        rightHip={{ x: 39, y: 36 }}
        legLength={7.5}
        stroke="#6f8d55"
        strokeWidth={3.2}
      />
      <ellipse cx="31" cy="29" rx="22" ry="13" fill="#6f8d55" />
      <circle cx="22" cy="15" r="8" fill="#8daa69" />
      <circle cx="40" cy="15" r="8" fill="#8daa69" />
      <circle cx="22" cy="15" r="4.2" fill="#eee7d8" />
      <circle cx="40" cy="15" r="4.2" fill="#eee7d8" />
      <TrackableEye side="left" cx={22} cy={15} r={2.2} fill="#28231f" />
      <TrackableEye side="right" cx={40} cy={15} r={2.2} fill="#28231f" />
      <path d="M25 31 H37" fill="none" stroke="#2f382a" strokeWidth="2" />
    </CharacterSvg>
  );
}

const NEW_RENDERERS: Record<Exclude<PixelCharacterId, "current">, ReactNode> = {
  dog: <DogRenderer />,
  sparrow: <SparrowRenderer />,
  cat: <CatRenderer />,
  penguin: <PenguinRenderer />,
  frog: <FrogRenderer />,
};

type PixelCharacterStageProps = {
  selected: PixelCharacterId;
  currentBodyRef?: Ref<HTMLDivElement>;
  currentLeftEyeRef?: Ref<HTMLSpanElement>;
  currentRightEyeRef?: Ref<HTMLSpanElement>;
};

export function PixelCharacterStage({
  selected,
  currentBodyRef,
  currentLeftEyeRef,
  currentRightEyeRef,
}: PixelCharacterStageProps) {
  return (
    <>
      {PIXEL_CHARACTERS.map(({ id }) => {
        const active = id === selected;
        return (
          <div
            key={id}
            data-pixel-character={id}
            data-active={active ? "true" : "false"}
            hidden={!active}
            className="absolute inset-0"
          >
            {id === "current" ? (
              <CurrentPixelRenderer
                bodyRef={currentBodyRef}
                leftEyeRef={currentLeftEyeRef}
                rightEyeRef={currentRightEyeRef}
              />
            ) : (
              NEW_RENDERERS[id]
            )}
          </div>
        );
      })}
    </>
  );
}
