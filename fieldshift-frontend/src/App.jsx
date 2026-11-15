import { useCallback, useEffect, useState } from "react";
import { STATIC_DEMO, analyze, getCrops, getDemoFarms, getFieldContext } from "./api.js";
import InputPanel from "./components/InputPanel.jsx";
import { ScoreRadar, StrategyCards, StrategyDetail } from "./components/Strategies.jsx";
import FieldCalendar from "./components/FieldCalendar.jsx";
import { ConfidencePanel, FieldFacts } from "./components/FieldFromSpace.jsx";
import { ClimateCharts, ClimateTiles, NdviChart, TrendCards } from "./components/Climate.jsx";
import { Dialogs, SoilCard, Suitability } from "./components/Extras.jsx";
import { themeChart } from "./components/charts.js";

const DEFAULT_PRIORITIES = { water: 3, nitrogen: 3, erosion: 3, organic_matter: 3, pest_break: 3, income: 3, forage: 1 };
const EMPTY_SOIL = { ph: null, om_pct: null, sand_pct: null, clay_pct: null, drainage_score: null };

export default function App() {
  const [crops, setCrops] = useState({});
  const [farms, setFarms] = useState([]);
  const [state, setState] = useState({
    lat: 42.03, lon: -93.62, farmId: null, rotation: [{ main: "corn", cover: null }, { main: "soybean", cover: null }],
    slope: "", irrigated: false, soil: EMPTY_SOIL, priorities: DEFAULT_PRIORITIES, tempDelta: 0, precipPct: 0, demo: false,
  });
  const set = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);
  const [mapView, setMapView] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [ctxLoading, setCtxLoading] = useState(false);
  const [usedDetected, setUsedDetected] = useState(false);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(1);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [fitKey, setFitKey] = useState(0);
  const [dialog, setDialog] = useState(null);

  const loadContext = useCallback(async (lat, lon, demo) => {
    setCtxLoading(true); setUsedDetected(false);
    try { setCtx(await getFieldContext(lat, lon, demo)); } catch { setCtx(null); }
    finally { setCtxLoading(false); }
  }, []);

  const pickFarm = useCallback((f, demo) => {
    set({ lat: f.lat, lon: f.lon, farmId: f.id, rotation: f.current_rotation.map((y) => ({ main: y.main, cover: y.cover || null })),
      priorities: { ...DEFAULT_PRIORITIES, ...f.priorities }, slope: f.slope || "" });
    setMapView({ lat: f.lat, lon: f.lon, zoom: 13, key: `${f.id}-${Date.now()}` });
    loadContext(f.lat, f.lon, demo);
  }, [set, loadContext]);

  // boot: crops + demo farms, optional ?lat=&lon=&demo=1&run=1 in the URL
  useEffect(() => {
    themeChart();
    (async () => {
      try {
        const [cr, fm] = await Promise.all([getCrops(), getDemoFarms()]);
        setCrops(Object.fromEntries(cr.crops.map((c) => [c.id, c])));
        setFarms(fm);
        const qs = new URLSearchParams(location.search);
        const demo = qs.get("demo") === "1";
        if (demo) set({ demo: true });
        pickFarm(fm[0], demo);
        if (qs.get("lat") && qs.get("lon")) set({ lat: Number(qs.get("lat")), lon: Number(qs.get("lon")) });
        if (qs.get("run") === "1") setTimeout(() => document.querySelector(".primary")?.click(), 300);
      } catch {
        setStatus("Could not reach the FieldShift API — is the FastAPI backend running on port 8000?");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onPick = (lat, lon) => { set({ lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)), farmId: null }); loadContext(lat, lon, state.demo); };
  const onUseDetected = (rot) => { set({ rotation: rot.map((y) => ({ main: y.main, cover: null })) }); setUsedDetected(true); };

  async function runAnalysis() {
    setBusy(true); setStatus("Fetching NASA data and scoring thousands of rotations…");
    const soil = state.soil;
    const body = {
      lat: state.lat, lon: state.lon, current_rotation: state.rotation, priorities: state.priorities,
      irrigated: state.irrigated, slope: state.slope || null,
      soil_override: Object.values(soil).some((v) => v !== null) ? soil : null,
      scenario: { temp_delta: state.tempDelta, precip_pct: state.precipPct }, demo: state.demo,
    };
    try {
      const data = await analyze(body);
      setResult(data); setSelected(data.strategies.length > 1 ? 1 : 0); setFitKey((k) => k + 1);
      setStatus(STATIC_DEMO ? "Loaded pre-computed demo result." : `Done in ${data.elapsed_s}s · ${data.candidates_evaluated} rotations evaluated.`);
    } catch (e) {
      setStatus(`Something went wrong: ${e.message}`);
    } finally { setBusy(false); }
  }

  const overlay = result ? { terrain: result.terrain, cdl: result.cdl } : ctx;
  const st = result?.data_status || {};
  const src = result?.sources || {};

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="var(--brand)" />
            <path d="M5 21c4-3 8-3 11 0s7 3 11 0M5 16c4-3 8-3 11 0s7 3 11 0" stroke="var(--wheat)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <circle cx="22" cy="9" r="3" fill="var(--wheat)" /></svg>
          <div><h1>FieldShift {STATIC_DEMO && <span className="mode-pill">preview</span>}</h1><p>Crop-rotation explorer powered by NASA Earth data</p></div>
        </div>
        <nav className="topnav">
          <button className="linkbtn" onClick={() => setDialog("how")}>How it works</button>
          <button className="linkbtn" onClick={() => setDialog("glossary")}>Glossary</button>
        </nav>
      </header>

      <main className="layout">
        <InputPanel state={state} set={set} crops={crops} demoFarms={farms} onPickFarm={(f) => pickFarm(f, state.demo)} onPick={onPick}
          ctx={ctx} ctxLoading={ctxLoading} onUseDetected={onUseDetected} usedDetected={usedDetected} onAnalyze={runAnalysis}
          busy={busy} status={status} mapView={mapView} overlay={overlay} fitKey={fitKey} />

        <section className="results" aria-live="polite">
          {STATIC_DEMO && (
            <div className="preview-note"><b>Hosted preview.</b> This page has no backend, so it shows results pre-computed by the FastAPI engine for the
              three demo farms (today's climate, and a +2 °C / −20% rain scenario) on <b>simulated data</b>. Run the project in VS Code for live
              NASA POWER, MODIS, SSURGO, SRTM, USDA CDL and ERA5 data and full recalculation for any field.</div>
          )}
          {!result ? (
            <div className="empty">
              <h2>Find rotations that fit your field, your water and your goals</h2>
              <p>FieldShift reads 20+ years of NASA climate, soil-moisture and vegetation data plus terrain, soil and crop-history
                data for your location, then compares your current rotation with three alternatives — with the evidence, benefits,
                gaps and risks for each.</p>
              <ol><li>Click your field on the map, or pick a demo farm.</li><li>Check the crops you grow now.</li>
                <li>Tell us what matters most, then press <b>Explore rotation options</b>.</li></ol>
            </div>
          ) : (
            <>
              {result.static_preview && <div className="banner info">Showing: {result.static_preview.farm} · {result.static_preview.scenario}. Edits to rotation or priorities need the live backend.</div>}
              {result.is_demo && <div className="banner demo">DEMO DATA — the numbers below are simulated, not real observations. {STATIC_DEMO ? "Run locally for real data." : "Untick “Offline demo data” with internet access for real data."}</div>}
              {result.notes.filter((n) => !n.startsWith("Demo mode")).map((n) => <div key={n} className="banner info">{n}</div>)}
              <div className="sources">
                {[["Climate", src.climate, st.climate === "ok"], ["Soil", src.soil, st.soil === "ok"],
                  ["Vegetation", src.ndvi || "MODIS NDVI unavailable", st.ndvi === "ok"],
                  ["Terrain", src.terrain || "SRTM unavailable", st.terrain === "ok"],
                  ["Crop history", src.cdl || (st.cdl === "outside USA" ? "CDL: USA only" : "CDL unavailable"), st.cdl === "ok"],
                  ["Cross-check", src.era5 || "ERA5 unavailable", st.era5 === "ok"]].map(([k, v, ok]) => (
                  <span key={k} className={`pill ${ok ? "ok" : "no"}`} title={v}>{k}: {v}</span>
                ))}
              </div>
              <article className="card narrative">
                <h3>Summary <span className="pill muted">{result.narrative.source === "template" ? "auto-generated" : result.narrative.source}</span></h3>
                <p>{result.narrative.text}</p>
              </article>

              <h2 className="section-title">Rotation strategies compared</h2>
              <StrategyCards result={result} selected={selected} onSelect={setSelected} />
              <div className="grid2"><ScoreRadar result={result} /><StrategyDetail result={result} selected={selected} /></div>
              <FieldCalendar result={result} crops={crops} />

              <h2 className="section-title">Your field from space</h2>
              <div className="grid2"><FieldFacts result={result} crops={crops} /><ConfidencePanel result={result} /></div>

              <h2 className="section-title">Your field's climate story</h2>
              <ClimateTiles s={result.climate.summary} />
              <ClimateCharts monthly={result.climate.monthly} />
              <TrendCards trends={result.climate.trends} />
              <NdviChart ndvi={result.ndvi} />
              <div className="grid2"><Suitability rows={result.suitability} /><SoilCard soil={result.soil} slope={result.slope} /></div>
              <p className="disclaimer">{result.disclaimer}</p>
            </>
          )}
        </section>
      </main>
      <Dialogs open={dialog} onClose={() => setDialog(null)} />
    </>
  );
}
