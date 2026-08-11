import { ImageResponse } from "next/og";
import {
  OG_SIZE,
  type OgInput,
  normalizeOgInput,
  ogCardFonts,
  ogImageDataUrl,
} from "./og";

function GuillocheLayer({
  crop = "full",
  opacity = 1,
}: {
  crop?: "full" | "band";
  opacity?: number;
}) {
  if (crop === "band") {
    return (
      <div
        tw="absolute inset-x-0 bottom-0 flex h-[250px] overflow-hidden"
        style={{ opacity }}
      >
        {/* ImageResponse/Satori requires a plain img for embedded rasters. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          aria-hidden="true"
          src={ogImageDataUrl("guilloche")}
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          tw="absolute left-0"
          style={{ bottom: -110 }}
        />
      </div>
    );
  }

  return (
    // ImageResponse/Satori requires a plain img for embedded raster layers.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      aria-hidden="true"
      src={ogImageDataUrl("guilloche")}
      width={OG_SIZE.width}
      height={OG_SIZE.height}
      tw="absolute inset-0"
      style={{ opacity }}
    />
  );
}

function HeroCard({ input }: { input: OgInput }) {
  return (
    <div
      tw="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-[#e9e3da] text-center text-[#18201d]"
      style={{ padding: "64px 88px" }}
    >
      <GuillocheLayer />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        src={ogImageDataUrl("glow")}
        width={900}
        height={520}
        tw="absolute"
        style={{ left: 150, top: 55 }}
      />

      <div
        tw="relative flex text-[15px] font-medium leading-none"
        style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.42em" }}
      >
        SOMU
      </div>

      <div tw="relative flex flex-col items-center" style={{ gap: 6 }}>
        {/* Satori never auto-shrinks type, so the headline steps down once past
            the width the 82px cut can hold inside 920px. */}
        <div
          tw="flex font-semibold leading-[1.06]"
          style={{
            fontFamily: "Poppins",
            fontSize: input.title.length > 22 ? 58 : 82,
            letterSpacing: "-0.035em",
            maxWidth: 920,
            whiteSpace: "pre-line",
          }}
        >
          {input.title}
        </div>
        <div
          tw="flex text-[44px] font-normal leading-none text-[#2f6f62]"
          // Tracked out to match the page treatment of the accent word.
          style={{ fontFamily: "DotGothic16", letterSpacing: "0.08em" }}
        >
          {input.accent ?? "Beautifully"}
        </div>
      </div>

      <div tw="relative flex flex-col items-center" style={{ gap: 10 }}>
        <div
          tw="flex text-[16px] font-medium leading-none text-[#5d6863]"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.24em" }}
        >
          {(input.name ?? "Eega Somasekhara Reddy").toUpperCase()}
        </div>
        <div
          tw="flex text-[15px] leading-none text-[#7d8983]"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.14em" }}
        >
          {input.stack}
        </div>
      </div>
    </div>
  );
}

function RailCard({ input }: { input: OgInput }) {
  const meta = input.meta ?? ["EEGA.DEV"];

  return (
    <div tw="relative flex h-full w-full overflow-hidden bg-[#e9e3da] text-[#18201d]">
      <GuillocheLayer opacity={0.78} />
      <div
        tw="absolute inset-y-0 left-0 flex"
        style={{
          width: 760,
          backgroundImage:
            "linear-gradient(90deg, rgba(233, 227, 218, 0.98) 45%, rgba(233, 227, 218, 0))",
        }}
      />

      <div
        tw="relative flex h-full w-full flex-col justify-between"
        style={{ padding: "72px 88px" }}
      >
        <div tw="flex items-center" style={{ gap: 14 }}>
          <div
            tw="flex text-[14px] font-medium leading-none text-[#2f6f62]"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.38em" }}
          >
            {input.kicker}
          </div>
          <div tw="flex h-px w-16 bg-[#2f6f62] opacity-50" />
        </div>

        <div tw="flex flex-col" style={{ gap: 20, maxWidth: 700 }}>
          <div
            tw="flex text-[66px] font-semibold leading-[1.12]"
            style={{ fontFamily: "Poppins", letterSpacing: "-0.035em" }}
          >
            {input.title}
          </div>
          {input.subtitle ? (
            <div
              tw="flex text-[21px] leading-[1.6] text-[#5d6863]"
              style={{ fontFamily: "Poppins", maxWidth: 760 }}
            >
              {input.subtitle}
            </div>
          ) : null}
        </div>

        <div
          tw="flex items-center text-[15px] leading-none text-[#7d8983]"
          style={{
            fontFamily: "JetBrains Mono",
            gap: 16,
            letterSpacing: "0.14em",
          }}
        >
          {meta.map((item, index) => (
            <div
              key={`${item}-${index}`}
              tw="flex items-center"
              style={{ gap: 16 }}
            >
              {index > 0 ? <span tw="text-[#d7dcd7]">·</span> : null}
              <span tw={index === 0 ? "text-[#5d6863]" : undefined}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BandCard({ input }: { input: OgInput }) {
  return (
    <div tw="relative flex h-full w-full overflow-hidden bg-[#e9e3da] text-[#18201d]">
      <GuillocheLayer crop="band" />
      <div
        tw="absolute inset-x-0 flex"
        style={{
          bottom: 140,
          height: 110,
          backgroundImage:
            "linear-gradient(#e9e3da, rgba(233, 227, 218, 0))",
        }}
      />

      <div
        tw="relative flex h-full w-full flex-col justify-between"
        style={{ padding: "74px 88px" }}
      >
        <div tw="flex items-baseline justify-between">
          <div
            tw="flex text-[14px] font-medium leading-none text-[#2f6f62]"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.34em" }}
          >
            {input.kicker}
          </div>
          <div
            tw="flex text-[15px] leading-none text-[#7d8983]"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.2em" }}
          >
            {input.metaLine}
          </div>
        </div>

        <div tw="flex flex-col" style={{ gap: 22, maxWidth: 820 }}>
          <div
            tw="flex text-[54px] font-medium leading-[1.22]"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "-0.04em" }}
          >
            {input.title}
          </div>
          {input.subtitle ? (
            <div
              tw="flex text-[20px] leading-[1.6] text-[#5d6863]"
              style={{ fontFamily: "Poppins", maxWidth: 780 }}
            >
              {input.subtitle}
            </div>
          ) : null}
        </div>

        <div tw="flex items-end justify-between">
          <div
            tw="flex text-[15px] font-medium leading-none text-[#5d6863]"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.28em" }}
          >
            EEGA.DEV
          </div>
          <div
            tw="flex text-[76px] font-normal leading-[0.8] text-[#2f6f62]"
            style={{
              fontFamily: "DotGothic16",
              opacity: 0.55,
            }}
          >
            {input.index ?? "00"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OgCard({ input }: { input: OgInput }) {
  if (input.template === "hero") return <HeroCard input={input} />;
  if (input.template === "band") return <BandCard input={input} />;
  return <RailCard input={input} />;
}

export function createOgImage(input: OgInput): ImageResponse {
  const normalizedInput = normalizeOgInput(input);
  return new ImageResponse(<OgCard input={normalizedInput} />, {
    ...OG_SIZE,
    fonts: ogCardFonts(),
  });
}
