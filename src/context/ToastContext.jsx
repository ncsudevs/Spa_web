import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { ToastContext } from "./toast-context";

const DEFAULT_DURATION = 4200;
const toneConfig = {
  success: {
    icon: CheckCircle2,
    cardClassName: "border-emerald-200 bg-white/95 text-emerald-950",
    badgeClassName: "bg-emerald-50 text-emerald-700",
  },
  error: {
    icon: AlertCircle,
    cardClassName: "border-rose-200 bg-white/95 text-rose-950",
    badgeClassName: "bg-rose-50 text-rose-700",
  },
  warning: {
    icon: AlertTriangle,
    cardClassName: "border-amber-200 bg-white/95 text-amber-950",
    badgeClassName: "bg-amber-50 text-amber-700",
  },
  info: {
    icon: Info,
    cardClassName: "border-stone-200 bg-white/95 text-stone-900",
    badgeClassName: "bg-stone-100 text-stone-700",
  },
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4 sm:justify-end sm:px-6"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex w-full max-w-md flex-col gap-3">
        {toasts.map((toast) => {
          const config = toneConfig[toast.tone] || toneConfig.info;
          const Icon = config.icon;

          return (
            <section
              key={toast.id}
              className={`toast-pop pointer-events-auto overflow-hidden rounded-[26px] border p-4 shadow-[0_24px_60px_rgba(39,24,20,0.16)] backdrop-blur-xl ${config.cardClassName}`}
              role={toast.tone === "error" ? "alert" : "status"}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.badgeClassName}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-6 text-stone-600">
                      {toast.description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      tone = "info",
      title,
      description = "",
      duration = DEFAULT_DURATION,
    }) => {
      const nextId = idRef.current + 1;
      idRef.current = nextId;

      setToasts((current) => [
        ...current,
        { id: nextId, tone, title, description },
      ]);

      if (duration > 0) {
        const timer = window.setTimeout(() => {
          dismissToast(nextId);
        }, duration);
        timersRef.current.set(nextId, timer);
      }

      return nextId;
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      success(title, description, options = {}) {
        return showToast({ tone: "success", title, description, ...options });
      },
      error(title, description, options = {}) {
        return showToast({ tone: "error", title, description, ...options });
      },
      warning(title, description, options = {}) {
        return showToast({ tone: "warning", title, description, ...options });
      },
      info(title, description, options = {}) {
        return showToast({ tone: "info", title, description, ...options });
      },
      dismissToast,
    }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
