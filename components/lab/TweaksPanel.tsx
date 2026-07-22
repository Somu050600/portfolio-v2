"use client";

import { SCHEMA, type HeroProps } from "./somuHero3dConfig";

/**
 * Live control panel for the Somu Hero 3D scene — a port of the Claude Design
 * "Tweaks" editor. Renders the shared SCHEMA: range sliders and color-swatch
 * pickers grouped by section. Purely controlled; state lives in the parent.
 */

type Props = {
  values: HeroProps;
  monoFont?: string;
  onChange: <K extends keyof HeroProps>(key: K, value: HeroProps[K]) => void;
  onReset: () => void;
  onClose: () => void;
};

export default function TweaksPanel({
  values,
  monoFont = "'IBM Plex Mono', ui-monospace, monospace",
  onChange,
  onReset,
  onClose,
}: Props) {
  return (
    <aside
      className="tweaks-panel"
      aria-label="Scene tweaks"
      style={{ fontFamily: monoFont }}
    >
      <style>{`
        .tweaks-panel {
          position: fixed; top: 16px; right: 16px; bottom: 16px; z-index: 50;
          width: min(320px, calc(100vw - 32px));
          display: flex; flex-direction: column;
          background: rgba(38, 33, 26, 0.72);
          backdrop-filter: blur(18px) saturate(1.1);
          -webkit-backdrop-filter: blur(18px) saturate(1.1);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
          color: #ece7dd;
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          overflow: hidden;
        }
        .tweaks-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 14px; flex: none;
        }
        .tweaks-head h2 { margin: 0; font-size: 17px; font-weight: 500; letter-spacing: .01em; }
        .tweaks-head-actions { display: flex; align-items: center; gap: 14px; }
        .tweaks-reset {
          border: 0; background: transparent; cursor: pointer; padding: 0;
          font: inherit; font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
          color: rgba(236, 231, 221, 0.5); transition: color .2s ease;
        }
        .tweaks-reset:hover { color: #ece7dd; }
        .tweaks-close {
          border: 0; background: transparent; cursor: pointer; padding: 0;
          width: 26px; height: 26px; display: grid; place-items: center;
          color: rgba(236, 231, 221, 0.7); transition: color .2s ease;
        }
        .tweaks-close:hover { color: #fff; }
        .tweaks-body { flex: 1; overflow-y: auto; padding: 0 20px 22px; }
        .tweaks-body::-webkit-scrollbar { width: 8px; }
        .tweaks-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12); border-radius: 8px;
        }
        .tweaks-section { font-size: 15px; font-weight: 500; color: rgba(236, 231, 221, 0.55);
          margin: 26px 0 12px; }
        .tweaks-row { margin: 0 0 18px; }
        .tweaks-row-head {
          display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;
        }
        .tweaks-row-head label { font-size: 15px; color: #ece7dd; }
        .tweaks-val { font-size: 15px; color: rgba(236, 231, 221, 0.65); font-variant-numeric: tabular-nums; }
        .tweaks-panel input[type="range"] {
          -webkit-appearance: none; appearance: none; width: 100%; height: 2px;
          background: rgba(255, 255, 255, 0.18); border-radius: 2px; outline: none; cursor: pointer;
        }
        .tweaks-panel input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%;
          background: #2E2B25; border: 2px solid #ece7dd; cursor: pointer;
        }
        .tweaks-panel input[type="range"]::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #2E2B25; border: 2px solid #ece7dd; cursor: pointer;
        }
        .tweaks-swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .tweaks-swatch {
          position: relative; aspect-ratio: 3 / 2; border-radius: 10px; cursor: pointer;
          border: 1px solid rgba(0, 0, 0, 0.18); padding: 0; transition: box-shadow .15s ease;
        }
        .tweaks-swatch[data-active="true"] {
          box-shadow: 0 0 0 2px rgba(236, 231, 221, 0.9);
        }
        .tweaks-swatch svg { position: absolute; top: 8px; left: 8px; }
      `}</style>

      <header className="tweaks-head">
        <h2>Tweaks</h2>
        <div className="tweaks-head-actions">
          <button type="button" className="tweaks-reset" onClick={onReset}>
            Reset
          </button>
          <button
            type="button"
            className="tweaks-close"
            onClick={onClose}
            aria-label="Close tweaks panel"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="tweaks-body">
        {SCHEMA.map((section) => (
          <div key={section.title}>
            <div className="tweaks-section">{section.title}</div>
            {section.controls.map((ctrl) => {
              if (ctrl.type === "range") {
                const value = values[ctrl.key];
                return (
                  <div key={ctrl.key} className="tweaks-row">
                    <div className="tweaks-row-head">
                      <label htmlFor={`tw-${ctrl.key}`}>{ctrl.key}</label>
                      <span className="tweaks-val">{value}</span>
                    </div>
                    <input
                      id={`tw-${ctrl.key}`}
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={value}
                      aria-label={ctrl.label}
                      onChange={(e) =>
                        onChange(ctrl.key, Number(e.target.value))
                      }
                    />
                  </div>
                );
              }
              const current = values[ctrl.key];
              return (
                <div key={ctrl.key} className="tweaks-row">
                  <div className="tweaks-row-head">
                    <label>{ctrl.key}</label>
                  </div>
                  <div className="tweaks-swatches">
                    {ctrl.options.map((opt) => {
                      const active = current.toLowerCase() === opt.toLowerCase();
                      // Pick a check colour that reads against the swatch.
                      const dark =
                        parseInt(opt.slice(1, 3), 16) * 0.299 +
                          parseInt(opt.slice(3, 5), 16) * 0.587 +
                          parseInt(opt.slice(5, 7), 16) * 0.114 <
                        140;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className="tweaks-swatch"
                          data-active={active}
                          style={{ background: opt }}
                          aria-label={`${ctrl.label}: ${opt}`}
                          aria-pressed={active}
                          onClick={() => onChange(ctrl.key, opt)}
                        >
                          {active && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path
                                d="M2.5 7.5l3 3 6-7"
                                stroke={dark ? "#fff" : "#2E2B25"}
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
