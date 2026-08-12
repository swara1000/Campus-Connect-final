# Admin Module — CampusConnect

A React + Vite + Tailwind CSS admin module with **Events**, **Clubs**,
**Placements**, and **Notifications** as separate components.

## Folder structure

```
admin-module/
│
├── src/
│   │
│   ├── components/
│   │     ├── Clubs.jsx
│   │     ├── Events.jsx
│   │     ├── Notifications.jsx
│   │     ├── Placements.jsx
│   │     └── Shared.jsx          (Toast, Modal, SearchBar, StatCard, etc.)
│   │
│   ├── data/
│   │     └── mockData.js         (seed data + color/status maps)
│   │
│   ├── AdminModule.jsx           (sidebar + header, switches sections)
│   ├── utils.js                  (uid, formatDate, initials, inputCls)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

## Getting started

```bash
cd admin-module
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Notes

- Data in `src/data/mockData.js` is in-memory mock data — wire your API
  calls into each component's `handleCreate` / `handleEdit` / `handleDelete`.
- Icons come from `lucide-react` (already in `package.json`).
- Styling is Tailwind CSS only — configured via `tailwind.config.js` and
  `postcss.config.js`, imported through `src/index.css`.
