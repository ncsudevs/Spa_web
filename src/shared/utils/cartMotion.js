export function launchCartFlight({ imageSrc, sourceElement, label = "" }) {
  if (!imageSrc || !sourceElement) return;

  const sourceRect = sourceElement.getBoundingClientRect();
  if (!sourceRect.width || !sourceRect.height) return;

  window.dispatchEvent(
    new CustomEvent("cartFlight", {
      detail: {
        imageSrc,
        label,
        sourceRect: {
          left: sourceRect.left,
          top: sourceRect.top,
          width: sourceRect.width,
          height: sourceRect.height,
        },
      },
    }),
  );
}
