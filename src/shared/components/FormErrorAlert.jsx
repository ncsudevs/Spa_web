export default function FormErrorAlert({ message, errorRef, className = "" }) {
  if (!message) return null;

  return (
    <div
      ref={errorRef}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className={`rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 outline-none ${className}`.trim()}
    >
      {message}
    </div>
  );
}
