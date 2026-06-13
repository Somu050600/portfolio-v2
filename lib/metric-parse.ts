export type ParsedMetric = {
  prefix: string;
  target: number;
  suffix: string;
  animatable: boolean;
  display: string;
};

/** Parse résumé-style metric strings for count-up animation. */
export function parseMetricValue(value: string): ParsedMetric {
  const display = value;

  const signed = value.match(/^([+−-]?)(\d+(?:\.\d+)?)(.*)$/);
  if (signed) {
    const prefix = signed[1] === "-" ? "−" : signed[1];
    const target = Number(signed[2]);
    const suffix = signed[3] ?? "";
    if (!Number.isNaN(target)) {
      return { prefix, target, suffix, animatable: true, display };
    }
  }

  const plain = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (plain) {
    const target = Number(plain[1]);
    if (!Number.isNaN(target)) {
      return {
        prefix: "",
        target,
        suffix: plain[2] ?? "",
        animatable: true,
        display,
      };
    }
  }

  return { prefix: "", target: 0, suffix: "", animatable: false, display };
}

export function formatMetric(
  parsed: ParsedMetric,
  current: number,
): string {
  if (!parsed.animatable) return parsed.display;
  const n =
    parsed.target % 1 === 0
      ? Math.round(current).toString()
      : current.toFixed(1);
  return `${parsed.prefix}${n}${parsed.suffix}`;
}
