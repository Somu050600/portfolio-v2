"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceDevelopSequence,
  isEditableShortcutTarget,
  nextTemperaturePreset,
  type TemperaturePreset,
} from "./landing-interactions";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return isEditableShortcutTarget({
    tagName: target.tagName,
    isContentEditable: target.isContentEditable,
  });
}

export function useLandingEasterEggs(activeLine: number | null) {
  const activeLineRef = useRef(activeLine);
  const sequenceRef = useRef("");
  const semanticTimerRef = useRef(0);
  const [lockedLine, setLockedLine] = useState<number | null>(null);
  const [technicalVisible, setTechnicalVisible] = useState(false);
  const [semanticVisible, setSemanticVisible] = useState(false);
  const [temperature, setTemperature] =
    useState<TemperaturePreset>("warm");

  useEffect(() => {
    activeLineRef.current = activeLine;
  }, [activeLine]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === "Alt") {
        setTechnicalVisible(true);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        setLockedLine((current) =>
          current === null ? (activeLineRef.current ?? 1) : null,
        );
        return;
      }

      if (event.key.length !== 1) return;
      const next = advanceDevelopSequence(sequenceRef.current, event.key);
      sequenceRef.current = next.buffer;
      if (!next.matched) return;

      setSemanticVisible(true);
      clearTimeout(semanticTimerRef.current);
      semanticTimerRef.current = window.setTimeout(
        () => setSemanticVisible(false),
        2000,
      );
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Alt") setTechnicalVisible(false);
    };

    const onBlur = () => setTechnicalVisible(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      clearTimeout(semanticTimerRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const cycleTemperature = useCallback(() => {
    setTemperature((current) => nextTemperaturePreset(current));
  }, []);

  return {
    lockedLine,
    technicalVisible,
    semanticVisible,
    temperature,
    cycleTemperature,
  };
}
