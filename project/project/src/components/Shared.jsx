import React from "react";
import { X, Search, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { initials, AVATAR_COLORS, selectCls, cardShadowCls, secondaryBtnCls, primaryBtnShadowCls } from "../utils";

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-100 bg-card px-4 py-3 shadow-lg shadow-slate-200/60 dark:border-emerald-900/50 dark:shadow-slate-950/40">
      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-foreground leading-tight">{toast.title}</p>
        {toast.subtitle && <p className="text-muted-foreground leading-tight">{toast.subtitle}</p>}
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className={`rounded-2xl glass p-5 ${cardShadowCls}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${tint}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-slate-900/40 p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl glass shadow-xl mt-10 sm:mt-0">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-lg p-1 -mr-1 -mt-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

// Consistent dropdown: native arrow replaced with an inset chevron so spacing
// and rendering match across browsers and pages.
export function Select({ value, onChange, children, className = "", ...rest }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${selectCls} ${className}`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-full bg-gradient-brand text-white hover:opacity-95 shrink-0 ${primaryBtnShadowCls}`}
        >
          {action.icon} {action.label}
        </button>
      )}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative max-w-[37.5%] ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Delete", tone = "danger", onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl p-6">
        <div className="flex items-start gap-3">
          <div
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
              tone === "danger" ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className={secondaryBtnCls}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-full text-white transition-shadow ${
              tone === "danger"
                ? "bg-red-600 hover:bg-red-700 shadow-[0_4px_14px_rgba(220,38,38,0.28)] hover:shadow-[0_6px_18px_rgba(220,38,38,0.38)]"
                : `bg-gradient-brand hover:opacity-95 ${primaryBtnShadowCls}`
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PersonListModal({ title, subtitle, people, meta, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-slate-900/40 p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl glass shadow-xl mt-10 sm:mt-0">
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-lg p-1 -mr-1 -mt-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 max-h-[420px] overflow-y-auto space-y-3">
          {people.map((p, i) => (
            <div key={`${p.rollNo || p.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3">
              <div
                className={`h-10 w-10 shrink-0 rounded-full text-white flex items-center justify-center font-semibold text-sm ${
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                }`}
              >
                {initials(p.name)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{p.name}</p>
                <p className="text-sm text-muted-foreground truncate">{meta(p)}</p>
              </div>
            </div>
          ))}
          {people.length === 0 && <EmptyState text="No one to show yet." />}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/60 py-14 text-center text-muted-foreground text-sm">
      {text}
    </div>
  );
}
