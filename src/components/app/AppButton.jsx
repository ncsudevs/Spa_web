// Centralized style map for reusable button variants across admin and customer pages.
const variantClassNames = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-stone-950 text-white hover:bg-stone-800',
  ghost: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

// Shared button wrapper to keep action styling consistent in the whole frontend.
export default function AppButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClassNames[variant] ?? variantClassNames.primary} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
