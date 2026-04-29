export default function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-surface rounded-[24px] ${className}`.trim()}
    />
  );
}
