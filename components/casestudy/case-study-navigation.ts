export type ObservedSection = {
  id: string;
  top: number;
};

export function getSectionProgress(
  activeId: string,
  orderedIds: string[],
) {
  const total = orderedIds.length;
  const activeIndex = orderedIds.indexOf(activeId);
  const current = total === 0 ? 0 : Math.max(activeIndex + 1, 1);

  return {
    current,
    total,
    label: `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  };
}

export function getActiveSectionId(
  entries: ObservedSection[],
  orderedIds: string[],
  currentId: string,
  observationLine = 0,
  articleEndVisible = false,
) {
  if (articleEndVisible) return orderedIds.at(-1) ?? currentId;

  const positions = new Map(entries.map((entry) => [entry.id, entry.top]));
  const visibleIds = orderedIds.filter((id) => positions.has(id));
  const passedIds = visibleIds.filter(
    (id) => (positions.get(id) ?? Infinity) <= observationLine,
  );

  if (passedIds.length > 0) return passedIds.at(-1) ?? currentId;

  return (
    visibleIds.toSorted(
      (a, b) => (positions.get(a) ?? Infinity) - (positions.get(b) ?? Infinity),
    )[0] ??
    currentId ??
    orderedIds[0] ??
    ""
  );
}

export function createSectionSelector(orderedIds: string[]) {
  let articleEndVisible = false;

  return {
    setArticleEndVisible(visible: boolean) {
      articleEndVisible = visible;
    },
    select(
      entries: ObservedSection[],
      currentId: string,
      observationLine = 0,
    ) {
      return getActiveSectionId(
        entries,
        orderedIds,
        currentId,
        observationLine,
        articleEndVisible,
      );
    },
  };
}
