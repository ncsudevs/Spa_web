import { AlertTriangle, RefreshCw } from "lucide-react";
import AppButton from "./AppButton";

export default function ErrorState({
  title = "Something went wrong",
  description,
  actionLabel = "Try again",
  onAction,
  className = "",
}) {
  return (
    <div
      className={`rounded-[28px] border border-rose-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,241,242,0.94))] p-6 shadow-[0_18px_44px_rgba(39,24,20,0.08)] ${className}`.trim()}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {onAction ? (
          <AppButton
            type="button"
            variant="ghost"
            className="rounded-full px-5"
            onClick={onAction}
          >
            <RefreshCw className="h-4 w-4" />
            {actionLabel}
          </AppButton>
        ) : null}
      </div>
    </div>
  );
}
