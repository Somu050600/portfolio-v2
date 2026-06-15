type PopstateBridge = {
  finish: () => void;
  transition: ViewTransition;
};

type StartViewTransitionArg =
  | ViewTransitionUpdateCallback
  | {
      update?: ViewTransitionUpdateCallback;
      types?: string[];
    };

let nativeStartViewTransition: typeof document.startViewTransition | undefined;
let popstateBridge: PopstateBridge | null = null;
let installed = false;

function isReactViewTransitionCall(
  arg: StartViewTransitionArg,
): arg is { update?: ViewTransitionUpdateCallback; types?: string[] } {
  return typeof arg === "object" && arg !== null && "update" in arg;
}

/** Swallow expected AbortErrors / timeouts from competing transitions. */
export function swallowViewTransitionAbort(vt: ViewTransition) {
  const ignore = (error: unknown) => {
    if (
      error instanceof DOMException &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      return;
    }
    throw error;
  };
  vt.ready.catch(ignore);
  vt.finished.catch(ignore);
  vt.updateCallbackDone.catch(ignore);
}

export function installViewTransitionCoordinator() {
  if (installed || typeof document === "undefined" || !document.startViewTransition) {
    return;
  }
  installed = true;
  nativeStartViewTransition = document.startViewTransition.bind(document);

  document.startViewTransition = (arg?: StartViewTransitionArg) => {
    // React uses the object form. During a popstate bridge, run its update
    // inside the already-active transition instead of starting a second one
    // (which would skip the first with AbortError per spec).
    if (popstateBridge && arg && isReactViewTransitionCall(arg)) {
      const result = arg.update?.();
      if (result != null && typeof (result as Promise<void>).then === "function") {
        (result as Promise<void>).catch(() => {});
      }
      swallowViewTransitionAbort(popstateBridge.transition);
      return popstateBridge.transition;
    }

    const vt = nativeStartViewTransition!(arg as ViewTransitionUpdateCallback);
    swallowViewTransitionAbort(vt);
    return vt;
  };
}

/** Start a popstate-owned transition (must use native, not the patched entry). */
export function startPopstateViewTransition(
  waitForCommit: Promise<void>,
): ViewTransition {
  const vt = nativeStartViewTransition!(() => waitForCommit);
  swallowViewTransitionAbort(vt);
  return vt;
}

export function setPopstateBridge(bridge: PopstateBridge | null) {
  popstateBridge = bridge;
}

export function finishPopstateBridge() {
  if (!popstateBridge) return;
  popstateBridge.finish();
}
