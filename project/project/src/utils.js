export function uid(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function formatDate(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const inputCls =
  "w-full rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60";

// Description fields keep a softer, non-circular radius.
export const textareaCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60";

// Dropdowns share the input's border/shadow treatment but use the same
// softer, non-circular radius as textareas — a full pill radius reads oddly
// on a control that opens a multi-item list.
export const selectCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2 pr-9 text-sm text-foreground shadow-[0_1px_3px_rgba(15,23,42,0.08)] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60";

// Card shadow used for stat cards, table containers and list cards — bumped
// up from the previous near-invisible 5% opacity version.
export const cardShadowCls = "shadow-[0_12px_30px_-18px_rgba(79,70,229,0.28)]";

// Primary (solid blue) action buttons get a visible tinted shadow instead of
// relying on Tailwind's neutral shadow-md, which read as flat on white.
export const primaryBtnShadowCls =
  "shadow-[0_4px_14px_rgba(79,70,229,0.28)] hover:shadow-[0_6px_18px_rgba(79,70,229,0.38)] transition-shadow";

// Shared button classes used by every form's footer (Events, Clubs,
// Placements, Study Materials, Notifications, ConfirmDialog) so every
// "Cancel" / primary submit button looks identical across the app.
export const secondaryBtnCls =
  "px-4 py-2 text-sm font-medium rounded-full text-muted-foreground border border-border bg-card shadow-[0_1px_3px_rgba(15,23,42,0.08)] hover:shadow-[0_2px_6px_rgba(15,23,42,0.16)] hover:bg-accent transition-shadow";

export const primaryBtnCls = `px-4 py-2 text-sm font-medium rounded-full bg-gradient-brand text-white hover:opacity-95 ${primaryBtnShadowCls}`;

// Converts a stored ISO date (yyyy-mm-dd) to the dd-mm-yyyy string shown in the date field.
export function isoToDMY(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}-${m}-${y}`;
}

// Converts a dd-mm-yyyy string typed by the user back to ISO (yyyy-mm-dd). Returns "" if invalid/incomplete.
export function dmyToISO(dmy) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec((dmy || "").trim());
  if (!match) return "";
  const [, d, m, y] = match;
  const date = new Date(`${y}-${m}-${d}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${y}-${m}-${d}`;
}

// Auto-inserts dashes as the user types digits for a dd-mm-yyyy field.
export function formatDMYInput(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return digits;
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Deterministically picks a roster preview (up to `cap` entries) out of the
// shared student pool for a given entity id, so the same club/event always
// shows the same sample list, while different entities show different ones.
export function rosterFor(pool, seedId, total, cap = 12) {
  if (!pool.length) return [];
  const offset = hashStr(String(seedId)) % pool.length;
  const count = Math.max(0, Math.min(total || 0, cap, pool.length));
  return Array.from({ length: count }, (_, i) => pool[(offset + i) % pool.length]);
}

export const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-orange-500",
  "bg-purple-600",
];
