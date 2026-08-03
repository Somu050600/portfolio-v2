type NumberedProject = {
  number: number;
};

export function arrangeWorkProjects<T extends NumberedProject>(
  projects: readonly T[],
): { featured: T | null; columns: [T[], T[]] } {
  const [featured, ...remaining] = [...projects].sort(
    (left, right) => left.number - right.number,
  );

  return {
    featured: featured ?? null,
    columns: [
      remaining.filter((_, index) => index % 2 === 0),
      remaining.filter((_, index) => index % 2 === 1),
    ],
  };
}

export function getTouchCardAction(
  pointerType: string,
  expanded: boolean,
): "reveal" | "navigate" {
  return pointerType === "touch" && !expanded ? "reveal" : "navigate";
}

export function getWorkListReserveHeight(
  contentHeight: number,
  containerWidth: number,
): number | null {
  return containerWidth < 640 ? null : contentHeight + 100;
}
