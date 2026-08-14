"use client";

import { ReactNode, useState, useCallback } from "react";

type Props = {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export default function AdminPageHeader({ title, description, children, actions }: Props) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "accent" | "danger" | "secondary" | "outline" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    accent: "bg-amber-600 text-white hover:bg-amber-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  return (
    <button className={`${base} ${styles[variant] || ""} ${className}`} {...props}>
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
    }, 3500);
  }, []);

  const ToastContainer = () => (
    <div className="fixed z-50 top-5 right-5 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-md shadow-lg text-sm text-white animate-[fadeIn_.2s_ease] ${
            t.type === "success"
              ? "bg-emerald-600"
              : t.type === "error"
              ? "bg-red-600"
              : "bg-slate-700"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );

  return { show, ToastContainer };
}

export function useConfirmDelete() {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: "", onConfirm: () => {} });

  const confirm = useCallback((message: string, onConfirm: () => void) => {
    setState({ open: true, message, onConfirm });
  }, []);

  const Dialog = () =>
    state.open ? (
      <div className="fixed z-50 inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Confirm Delete
          </h3>
          <p className="text-sm text-slate-600 mb-6">{state.message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setState((s) => ({ ...s, open: false }))}
              className="px-4 py-2 text-sm rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                state.onConfirm();
                setState((s) => ({ ...s, open: false }));
              }}
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
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
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function inputClass() {
  return "w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white";
}
