import { useCallback, useEffect, useRef } from "react";

function focusWithoutJump(node) {
  if (!node || typeof node.focus !== "function") return;

  try {
    node.focus({ preventScroll: true });
  } catch {
    node.focus();
  }
}

function scrollIntoView(node, block = "center") {
  if (!node || typeof node.scrollIntoView !== "function") return;

  node.scrollIntoView({
    behavior: "smooth",
    block,
    inline: "nearest",
  });
}

export function focusAndScrollField(node, block = "center") {
  if (!(node instanceof HTMLElement)) return false;

  node.setAttribute("aria-invalid", "true");
  focusWithoutJump(node);
  scrollIntoView(node, block);
  return true;
}

export default function useFormErrorAssist(error) {
  const errorRef = useRef(null);
  const skipNextErrorScrollRef = useRef(false);

  useEffect(() => {
    if (skipNextErrorScrollRef.current) {
      skipNextErrorScrollRef.current = false;
      return undefined;
    }

    if (!error || !(errorRef.current instanceof HTMLElement)) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      focusWithoutJump(errorRef.current);
      scrollIntoView(errorRef.current, "start");
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [error]);

  const handleInvalidCapture = useCallback((event) => {
    const target = event.target;

    window.requestAnimationFrame(() => {
      focusAndScrollField(target);
    });
  }, []);

  const handleFieldInteraction = useCallback((event) => {
    const target = event.target;

    if (
      target instanceof HTMLElement &&
      target.getAttribute("aria-invalid") === "true"
    ) {
      target.removeAttribute("aria-invalid");
    }
  }, []);

  return {
    errorRef,
    skipNextErrorScroll() {
      skipNextErrorScrollRef.current = true;
    },
    formProps: {
      onInvalidCapture: handleInvalidCapture,
      onInputCapture: handleFieldInteraction,
      onChangeCapture: handleFieldInteraction,
    },
  };
}
