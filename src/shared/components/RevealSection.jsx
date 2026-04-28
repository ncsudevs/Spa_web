import { useEffect, useRef, useState } from "react";

export default function RevealSection({
  children,
  className = "",
  delay = 0,
  distance = 22,
  duration = 0.7,
  as: tag = "section",
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const sharedProps = {
    ref,
    className: `reveal-section ${isVisible ? "is-visible" : ""} ${className}`.trim(),
    style: {
      "--reveal-delay": `${delay}s`,
      "--reveal-distance": `${distance}px`,
      "--reveal-duration": `${duration}s`,
    },
  };

  if (tag === "div") return <div {...sharedProps}>{children}</div>;
  if (tag === "footer") return <footer {...sharedProps}>{children}</footer>;
  if (tag === "article") return <article {...sharedProps}>{children}</article>;
  return <section {...sharedProps}>{children}</section>;
}
