import { useEffect, useRef, useState } from "react";

export default function TableScrollFrame({
  children,
  className = "",
  scrollAreaClassName = "",
}) {
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);
  const syncLockRef = useRef(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [showTopBar, setShowTopBar] = useState(false);

  useEffect(() => {
    const bottomNode = bottomScrollRef.current;
    if (!bottomNode) return undefined;

    const syncMetrics = () => {
      const nextTrackWidth = bottomNode.scrollWidth;
      setTrackWidth(nextTrackWidth);
      setShowTopBar(nextTrackWidth > bottomNode.clientWidth + 8);
    };

    syncMetrics();

    const resizeObserver = new ResizeObserver(syncMetrics);
    resizeObserver.observe(bottomNode);

    const contentNode = bottomNode.firstElementChild;
    if (contentNode) {
      resizeObserver.observe(contentNode);
    }

    window.addEventListener("resize", syncMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncMetrics);
    };
  }, []);

  function syncScroll(sourceRef, targetRef) {
    const source = sourceRef.current;
    const target = targetRef.current;
    if (!source || !target || syncLockRef.current) return;

    syncLockRef.current = true;
    target.scrollLeft = source.scrollLeft;
    window.requestAnimationFrame(() => {
      syncLockRef.current = false;
    });
  }

  return (
    <div className={className}>
      {showTopBar ? (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium text-stone-500">
            Swipe horizontally to see more columns.
          </p>
          <div
            ref={topScrollRef}
            className="overflow-x-auto rounded-full border border-stone-200 bg-stone-50"
            onScroll={() => syncScroll(topScrollRef, bottomScrollRef)}
          >
            <div style={{ width: trackWidth, height: 14 }} />
          </div>
        </div>
      ) : null}

      <div
        ref={bottomScrollRef}
        className={scrollAreaClassName}
        onScroll={() => syncScroll(bottomScrollRef, topScrollRef)}
      >
        {children}
      </div>
    </div>
  );
}
