"use client";

import { ReactNode, useState, useCallback, useEffect } from "react";

type Props = {
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export default function AdminPageHeader({ title, description, children, actions }: Props) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] md:text-2xl font-display font-semibold text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2 md:justify-end shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`bg-white border border-slate-200/70 rounded-xl shadow-sm ${
        hover
          ? "transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp = true,
  href,
  gradient = "from-slate-800 to-slate-900",
  accent = "bg-slate-100 text-slate-700",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
  trendUp?: boolean;
  href?: string;
  gradient?: string;
  accent?: string;
  delay?: number;
}) {
  const content = (
    <div className="p-5 md:p-6 h-full flex flex-col justify-between gap-4 relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-[0.08] blur-2xl pointer-events-none"
        style={{ background: undefined }} />
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${accent} shrink-0`}>
          <span className="text-lg font-semibold">{icon || label.charAt(0)}</span>
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
              trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl md:text-[34px] font-display font-bold text-slate-900 tracking-tight leading-none">
          {value}
        </div>
        <div className="mt-2 text-[13px] text-slate-500 font-medium">{label}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block group focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-xl"
        style={{ animationDelay: `${delay}ms` }}
      >
        <AdminCard hover className="h-full">
          {content}
        </AdminCard>
      </a>
    );
  }

  return <AdminCard className="h-full">{content}</AdminCard>;
}

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "accent" | "danger" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  const styles: Record<string, string> = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm shadow-slate-900/10 focus:ring-slate-500",
    accent:
      "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-700 hover:to-amber-600 active:from-amber-700 active:to-amber-700 shadow-md shadow-amber-500/25 focus:ring-amber-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/10 focus:ring-red-500",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus:ring-slate-400",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${styles[variant] || ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type ToastType = "success" | "error" | "info";
export function useToast() {
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: ToastType }[]
  >([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const ToastContainer = () => (
    <div className="fixed z-[100] top-4 right-4 md:top-5 md:right-5 space-y-2 max-w-sm w-[calc(100%-2rem)] md:w-auto">
      {toasts.map((t, idx) => (
        <div
          key={t.id}
          className={`relative overflow-hidden rounded-xl shadow-xl shadow-slate-900/10 backdrop-blur-sm text-white border border-white/10 ${
            t.type === "success"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
              : t.type === "error"
              ? "bg-gradient-to-r from-red-600 to-rose-500"
              : "bg-gradient-to-r from-slate-700 to-slate-600"
          }`}
          style={{
            animation: `slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 60}ms both`,
          }}
        >
          <div className="flex items-start gap-3 p-3.5 md:p-4">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-[15px] font-bold">
              {t.type === "success" ? "✓" : t.type === "error" ? "!" : "ℹ"}
            </div>
            <div className="flex-1 min-w-0 text-sm font-medium leading-snug pt-0.5">
              {t.message}
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              className="shrink-0 -mr-1 -mt-1 p-1 rounded-md hover:bg-white/15 transition text-white/70 hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-white/30"
            style={{ animation: "shrink 3.8s linear forwards" }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );

  return { show, ToastContainer };
}

export function useConfirmDelete() {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    title?: string;
    onConfirm: () => void;
  }>({ open: false, message: "", title: "", onConfirm: () => {} });

  const confirm = useCallback(
    (message: string, onConfirm: () => void, title?: string) => {
      setState({ open: true, message, onConfirm, title });
    },
    []
  );

  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState((s) => ({ ...s, open: false }));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.open]);

  const Dialog = () =>
    state.open ? (
      <div
        className="fixed z-[90] inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setState((s) => ({ ...s, open: false }))}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      >
        <div
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
                !
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  {state.title || "Confirm Delete"}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {state.message}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              onClick={() => setState((s) => ({ ...s, open: false }))}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                state.onConfirm();
                setState((s) => ({ ...s, open: false }));
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20 transition"
            >
              Delete
            </button>
          </div>
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      </div>
    ) : null;

  return { confirm, Dialog };
}

export function Field({
  label,
  children,
  hint,
  error,
  className = "",
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold text-slate-700 tracking-tight">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500 leading-relaxed">{hint}</p>}
      {error && (
        <div className="flex items-start gap-1.5">
          <span className="text-red-500 text-xs mt-0.5">!</span>
          <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}

export function inputClass() {
  return "w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:ring-offset-0 transition bg-white placeholder:text-slate-400 hover:border-slate-400";
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "amber";
  className?: string;
}) {
  const styles: Record<string, string> = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
    info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    amber: "bg-amber-500 text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
