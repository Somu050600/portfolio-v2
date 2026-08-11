type NumberedProject = {
  number: number;
};

/**
 * Splits the non-featured cards into two independently-flowing columns in
 * sequential halves, not alternating parity. Both columns keep their own
 * height (the staggered look), and because the first column holds the first
 * half of the set, DOM order, keyboard order and the printed `No. NN`
 * ordinals all read the same way: down column one, then down column two.
 */
export function arrangeWorkProjects<T extends NumberedProject>(
  projects: readonly T[],
): { featured: T | null; columns: [T[], T[]] } {
  const [featured, ...remaining] = [...projects].sort(
    (left, right) => left.number - right.number,
  );
  const firstColumnLength = Math.ceil(remaining.length / 2);

  return {
    featured: featured ?? null,
    columns: [
      remaining.slice(0, firstColumnLength),
      remaining.slice(firstColumnLength),
    ],
  };
}

export function getWorkListReserveHeight(
  contentHeight: number,
  containerWidth: number,
): number | null {
  return containerWidth < 640 ? null : contentHeight + 100;
}
