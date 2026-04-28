import { useEffect, useRef } from "react";

function createImpact(container, targetRect) {
  const impact = document.createElement("div");
  impact.className = "cart-flight-impact";
  impact.style.left = `${targetRect.left + targetRect.width / 2 - 28}px`;
  impact.style.top = `${targetRect.top + targetRect.height / 2 - 28}px`;
  container.appendChild(impact);

  impact.animate(
    [
      { transform: "scale(0.3)", opacity: 0.55 },
      { transform: "scale(1.35)", opacity: 0 },
    ],
    {
      duration: 420,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards",
    },
  ).finished.finally(() => {
    impact.remove();
  });
}

function spawnCartFlight(container, detail) {
  const target = document.querySelector("[data-cart-target]");
  if (!container || !target || !detail?.sourceRect || !detail?.imageSrc) return;

  const source = detail.sourceRect;
  const targetRect = target.getBoundingClientRect();
  const startWidth = Math.max(
    148,
    Math.min(190, Math.min(source.width * 0.62, 190)),
  );
  const startHeight = Math.round(startWidth * 0.66);
  const endWidth = Math.max(22, Math.min(30, targetRect.width * 0.62));
  const endHeight = Math.round(endWidth * 0.66);
  const startX = source.left + source.width / 2 - startWidth / 2;
  const startY = source.top + source.height / 2 - startHeight / 2;
  const endX = targetRect.left + targetRect.width / 2 - endWidth / 2;
  const endY = targetRect.top + targetRect.height / 2 - endHeight / 2;
  const dx = endX - startX;
  const dy = endY - startY;
  const arcLift = Math.max(84, Math.abs(dx) * 0.12);

  const glow = document.createElement("div");
  glow.className = "cart-flight-glow";
  glow.style.left = `${startX - 12}px`;
  glow.style.top = `${startY - 12}px`;
  glow.style.width = `${startWidth + 24}px`;
  glow.style.height = `${startHeight + 24}px`;

  const flyer = document.createElement("div");
  flyer.className = "cart-flight-chip";
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.width = `${startWidth}px`;
  flyer.style.height = `${startHeight}px`;

  const img = document.createElement("img");
  img.src = detail.imageSrc;
  img.alt = "";
  img.className = "h-full w-full object-cover";
  img.setAttribute("aria-hidden", "true");
  flyer.appendChild(img);

  if (detail.label) {
    const label = document.createElement("div");
    label.className = "cart-flight-chip-label";
    label.textContent = detail.label;
    flyer.appendChild(label);
  }

  container.appendChild(glow);
  container.appendChild(flyer);

  glow.animate(
    [
      {
        transform: "translate3d(0, 0, 0) scale(0.92)",
        opacity: 0,
      },
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        opacity: 0.34,
        offset: 0.16,
      },
      {
        transform: `translate3d(${dx * 0.54}px, ${dy * 0.42 - arcLift * 0.8}px, 0) scale(0.82)`,
        opacity: 0.22,
        offset: 0.58,
      },
      {
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.18)`,
        opacity: 0,
      },
    ],
    {
      duration: 980,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      fill: "forwards",
    },
  ).finished.finally(() => {
    glow.remove();
  });

  flyer.animate(
    [
      {
        transform: "translate3d(0, 0, 0) scale(0.9) rotate(-10deg)",
        opacity: 0,
      },
      {
        transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)",
        opacity: 1,
        offset: 0.12,
      },
      {
        transform: `translate3d(${dx * 0.58}px, ${dy * 0.42 - arcLift}px, 0) scale(0.88) rotate(7deg)`,
        opacity: 1,
        offset: 0.72,
      },
      {
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(${endWidth / startWidth}) rotate(14deg)`,
        opacity: 0.06,
      },
    ],
    {
      duration: 980,
      easing: "cubic-bezier(0.18, 0.86, 0.2, 1)",
      fill: "forwards",
    },
  ).finished.finally(() => {
    flyer.remove();
    createImpact(container, targetRect);
    window.dispatchEvent(new Event("cartBounce"));
  });
}

export default function CartFlightOverlay() {
  const containerRef = useRef(null);

  useEffect(() => {
    function handleCartFlight(event) {
      spawnCartFlight(containerRef.current, event.detail);
    }

    window.addEventListener("cartFlight", handleCartFlight);
    return () => window.removeEventListener("cartFlight", handleCartFlight);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
    />
  );
}
