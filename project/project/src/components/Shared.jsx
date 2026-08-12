import React from "react";
import { X, Search, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { initials, AVATAR_COLORS, selectCls, cardShadowCls, secondaryBtnCls, primaryBtnShadowCls } from "../utils";

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-lg shadow-slate-200/60">
      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-slate-800 leading-tight">{toast.title}</p>
        {toast.subtitle && <p className="text-slate-500 leading-tight">{toast.subtitle}</p>}
      </div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-5 ${cardShadowCls}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${tint}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start sm:items-center justify-center bg-slate-900/40 p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl mt-10 sm:mt-0">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 -mr-1 -mt-1">
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
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
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
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-full bg-blue-600 text-white hover:bg-blue-700 shrink-0 ${primaryBtnShadowCls}`}
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
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 shadow-[0_1px_3px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
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
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-start gap-3">
          <div
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
              tone === "danger" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
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
                : `bg-blue-600 hover:bg-blue-700 ${primaryBtnShadowCls}`
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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl mt-10 sm:mt-0">
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 -mr-1 -mt-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 max-h-[420px] overflow-y-auto space-y-3">
          {people.map((p, i) => (
            <div key={`${p.rollNo || p.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <div
                className={`h-10 w-10 shrink-0 rounded-full text-white flex items-center justify-center font-semibold text-sm ${
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                }`}
              >
                {initials(p.name)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{p.name}</p>
                <p className="text-sm text-slate-500 truncate">{meta(p)}</p>
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
    <div className="col-span-full rounded-2xl border border-dashed border-slate-200 py-14 text-center text-slate-400 text-sm">
      {text}
    </div>
  );
}
