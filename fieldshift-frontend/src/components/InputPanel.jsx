import MapPicker from "./MapPicker.jsx";
import { PRIORITIES, SHORT, shortName, signed } from "../lib.js";
import { STATIC_DEMO } from "../api.js";

function FieldContextBox({ ctx, loading, crops, onUse, used }) {
  if (!ctx && !loading) return null;
  if (loading) return <div className="fieldctx"><span className="loading" />Reading USDA crop history and SRTM terrain for this spot…</div>;
  const { terrain: t, cdl, cdl_note } = ctx;
  const det = cdl?.detected;
  return (
    <div className="fieldctx">
      {t && <div><b>Terrain:</b> {t.elevation_m} m, slope {t.slope_pct}% ({t.slope_class}), faces {t.aspect}</div>}
      {cdl ? (
        <>
          <div style={{ marginTop: ".4rem" }}><b>Crops at this field (USDA CDL):</b></div>
          <div className="histrow">
            {cdl.history.map((h) => (
              <span className="yr" key={h.year}><b>{h.year}</b>{h.crop_id ? SHORT[h.crop_id] || h.category : h.category}</span>
            ))}
          </div>
          {det?.rotation?.length > 0 && (
            <>
              <div>Detected rotation: <b>{det.rotation.map((y) => shortName(crops, y.main)).join(" → ")}</b> ({Math.round(det.agreement * 100)}% of years fit)</div>
              <button className="small-btn" style={{ marginTop: ".4rem" }} onClick={() => onUse(det.rotation)}>
                {used ? "✓ Rotation filled in" : "Use as my current rotation"}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="hint" style={{ marginTop: ".3rem" }}>{cdl_note || "No crop history found here — enter your rotation below."}</div>
      )}
    </div>
  );
}

export default function InputPanel({ state, set, crops, demoFarms, onPickFarm, onPick, ctx, ctxLoading, onUseDetected,
  usedDetected, onAnalyze, busy, status, mapView, overlay, fitKey }) {
  const cropList = Object.values(crops);
  const mains = cropList.filter((c) => c.type !== "cover");
  const covers = cropList.filter((c) => c.type === "cover");
  const setYear = (i, key, val) => set({ rotation: state.rotation.map((y, k) => (k === i ? { ...y, [key]: val || null } : y)) });
  const setSoil = (key, val) => set({ soil: { ...state.soil, [key]: val === "" ? null : Number(val) } });

  return (
    <aside className="panel inputs" aria-label="Farm inputs">
      <section className="step">
        <h2><span className="num">1</span> Pick your field</h2>
        <MapPicker lat={state.lat} lon={state.lon} view={mapView} onPick={onPick} terrain={overlay?.terrain}
          cdl={overlay?.cdl} crops={crops} fitKey={fitKey} />
        <div className="row2">
          <label>Latitude<input type="number" step="0.0001" value={state.lat}
            onChange={(e) => set({ lat: Number(e.target.value) })} onBlur={() => onPick(state.lat, state.lon)} /></label>
          <label>Longitude<input type="number" step="0.0001" value={state.lon}
            onChange={(e) => set({ lon: Number(e.target.value) })} onBlur={() => onPick(state.lat, state.lon)} /></label>
        </div>
        <div className="chips" aria-label="Demo farms">
          {demoFarms.map((f) => (
            <button key={f.id} className={`chip ${state.farmId === f.id ? "active" : ""}`} onClick={() => onPickFarm(f)}>{f.name}</button>
          ))}
        </div>
        <FieldContextBox ctx={ctx} loading={ctxLoading} crops={crops} onUse={onUseDetected} used={usedDetected} />
      </section>

      <section className="step">
        <h2><span className="num">2</span> Your current rotation</h2>
        <p className="hint">One row per year. Winter crops go in the year they're <b>harvested</b>; a cover crop is sown <b>after</b> that year's main crop.</p>
        {state.rotation.map((y, i) => (
          <div className="rot-row" key={i}>
            <span>Year {i + 1}</span>
            <select aria-label={`Year ${i + 1} main crop`} value={y.main} onChange={(e) => setYear(i, "main", e.target.value)}>
              {mains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select aria-label={`Year ${i + 1} cover crop`} value={y.cover || ""} onChange={(e) => setYear(i, "cover", e.target.value)}>
              <option value="">No cover crop</option>
              {covers.map((c) => <option key={c.id} value={c.id}>{c.name.replace(" (cover)", "")}</option>)}
            </select>
          </div>
        ))}
        <div className="row-btns">
          <button className="ghost" disabled={state.rotation.length >= 6}
            onClick={() => set({ rotation: [...state.rotation, { main: "soybean", cover: null }] })}>+ Add year</button>
          <button className="ghost" disabled={state.rotation.length <= 1}
            onClick={() => set({ rotation: state.rotation.slice(0, -1) })}>− Remove year</button>
        </div>
        <div className="row2">
          <label>Field slope
            <select value={state.slope} onChange={(e) => set({ slope: e.target.value })}>
              <option value="">Auto (from SRTM terrain)</option>
              <option value="flat">Flat (&lt;2%)</option>
              <option value="gentle">Gentle (2–6%)</option>
              <option value="steep">Steep (&gt;6%)</option>
            </select>
          </label>
          <label className="check"><input type="checkbox" checked={state.irrigated} onChange={(e) => set({ irrigated: e.target.checked })} /> Irrigation available</label>
        </div>
        <details className="soil">
          <summary>Add your soil test (optional)</summary>
          <div className="row2">
            <label>pH<input type="number" step="0.1" min="3" max="10" placeholder="e.g. 6.5" value={state.soil.ph ?? ""} onChange={(e) => setSoil("ph", e.target.value)} /></label>
            <label>Organic matter %<input type="number" step="0.1" min="0" max="30" placeholder="e.g. 3.0" value={state.soil.om_pct ?? ""} onChange={(e) => setSoil("om_pct", e.target.value)} /></label>
            <label>Sand %<input type="number" min="0" max="100" value={state.soil.sand_pct ?? ""} onChange={(e) => setSoil("sand_pct", e.target.value)} /></label>
            <label>Clay %<input type="number" min="0" max="100" value={state.soil.clay_pct ?? ""} onChange={(e) => setSoil("clay_pct", e.target.value)} /></label>
          </div>
          <label>Drainage
            <select value={state.soil.drainage_score ?? ""} onChange={(e) => setSoil("drainage_score", e.target.value)}>
              <option value="">Unknown</option>
              <option value="1.5">Poorly drained</option>
              <option value="3">Moderately well drained</option>
              <option value="4">Well drained</option>
              <option value="5">Excessively drained</option>
            </select>
          </label>
        </details>
      </section>

      <section className="step">
        <h2><span className="num">3</span> What matters to you?</h2>
        <p className="hint">0 = don't care · 5 = top priority</p>
        {PRIORITIES.map(([k, label]) => (
          <div className="prio" key={k}>
            <label htmlFor={`p_${k}`}>{label}</label><output>{state.priorities[k]}</output>
            <input id={`p_${k}`} type="range" min="0" max="5" step="1" value={state.priorities[k]}
              onChange={(e) => set({ priorities: { ...state.priorities, [k]: Number(e.target.value) } })} />
          </div>
        ))}
      </section>

      <section className="step">
        <h2><span className="num">4</span> What if the climate keeps changing?</h2>
        <label className="slider">Temperature change <output>{signed(state.tempDelta, 1)} °C</output>
          <input type="range" min="-1" max="4" step="0.5" value={state.tempDelta} onChange={(e) => set({ tempDelta: Number(e.target.value) })} /></label>
        <label className="slider">Rainfall change <output>{signed(state.precipPct)} %</output>
          <input type="range" min="-30" max="30" step="5" value={state.precipPct} onChange={(e) => set({ precipPct: Number(e.target.value) })} /></label>
      </section>

      {!STATIC_DEMO && (
        <label className="check demo-toggle"><input type="checkbox" checked={state.demo} onChange={(e) => set({ demo: e.target.checked })} /> Offline demo data (no internet needed)</label>
      )}
      <button className="primary" onClick={onAnalyze} disabled={busy}>{busy ? "Working…" : "Explore rotation options"}</button>
      <p className="status" role="status" aria-live="polite">{busy && <span className="loading" />}{status}</p>
    </aside>
  );
}
