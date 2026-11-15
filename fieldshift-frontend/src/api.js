/* API client. Live mode talks to the FastAPI backend (which fetches NASA POWER, MODIS,
   SSURGO/SoilGrids, SRTM, USDA CDL and ERA5). Static-demo mode (npm run build:demo) answers
   from pre-computed snapshots bundled into the page, so it runs with no backend at all. */
/* global __STATIC_DEMO__ */
export const STATIC_DEMO = __STATIC_DEMO__; // replaced at build time by vite.config.js

let snapshotsPromise = null;
const snapshots = () => (snapshotsPromise ??= import("./demo/snapshots.json").then((m) => m.default));

async function json(url, opts) {
  const r = await fetch(url, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.detail ? JSON.stringify(data.detail) : `${r.status} ${r.statusText}`);
  return data;
}

function nearestFarm(snap, lat, lon) {
  return snap.farms.reduce((best, f) =>
    (f.lat - lat) ** 2 + (f.lon - lon) ** 2 < (best.lat - lat) ** 2 + (best.lon - lon) ** 2 ? f : best);
}

export async function getCrops() {
  if (STATIC_DEMO) return { crops: (await snapshots()).crops };
  return json("/api/crops");
}

export async function getDemoFarms() {
  if (STATIC_DEMO) return (await snapshots()).farms.map(({ runs, context, ...f }) => f);
  return json("/api/demo-farms");
}

export async function getFieldContext(lat, lon, demo) {
  if (STATIC_DEMO) return nearestFarm(await snapshots(), lat, lon).context;
  return json(`/api/field-context?${new URLSearchParams({ lat, lon, demo_mode: demo })}`);
}

export async function analyze(body) {
  if (STATIC_DEMO) {
    const farm = nearestFarm(await snapshots(), body.lat, body.lon);
    const hotDry = body.scenario.temp_delta >= 1 || body.scenario.precip_pct <= -10;
    const res = structuredClone(hotDry ? farm.runs.hot_dry : farm.runs.base);
    res.static_preview = { farm: farm.name, scenario: hotDry ? "+2 °C, −20% rain" : "today's climate" };
    return res;
  }
  return json("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
