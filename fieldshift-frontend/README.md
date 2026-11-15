# FieldShift — frontend (React 18 · Vite · Leaflet · Chart.js)

The website. It talks to the backend on http://localhost:8000 (proxied as `/api`).

```bash
npm install
npm run dev          # http://localhost:5173   (start the backend first)
npm run build        # production build -> dist/  (served by the backend at :8000)
npm run build:demo   # offline single-file preview -> dist-demo/index.html
```

Main places to edit: `vite.config.js` (backend address), `src/lib.js` (labels), `src/styles.css` (colours),
`src/components/Extras.jsx` (glossary text), `src/App.jsx` (page layout), `src/api.js` (API calls).
See `../fieldshift-run-guide/FieldShift_Guide.html` for the full colour-coded guide.
