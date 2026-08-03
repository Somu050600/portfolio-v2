"use client";

import LiquidDistortionDemo from "@/components/casestudy/demos/LiquidDistortionDemo";
import type { TreatmentProps } from "../registry";

export default function LiquidDistortionPreview({
  active,
}: TreatmentProps) {
  return (
    <div className="absolute inset-0">
      <LiquidDistortionDemo
        autoplay={active}
        variant="thumbnail"
      />
    </div>
  );
}
