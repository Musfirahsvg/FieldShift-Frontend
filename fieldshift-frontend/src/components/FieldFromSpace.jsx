import { Line } from "react-chartjs-2";
import { SHORT, cssVar, shortName, signed } from "../lib.js";
import { baseOptions, lineSeries } from "./charts.js";

export function FieldFacts({ result, crops }) {
  const t = result.terrain, c = result.cdl;
  const near = Object.entries(c?.nearby_crops || {}).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${shortName(crops, k)} (${n})`).join(", ");
  return (
    <article className="card">
      <h3>Crop history, terrain and neighbours</h3>
      <table className="facts"><tbody>
        {t ? (<>
          <tr><th>Elevation</th><td>{t.elevation_m} m</td></tr>
          <tr><th>Slope at the field</th><td>{t.slope_pct}% facing {t.aspect} → <b>{t.slope_class}</b> erosion class</td></tr>
          <tr><th>Relief across 400 m</th><td>{t.relief_m} m · {Math.round(t.steep_share * 100)}% of the area is steep (&gt;6%)</td></tr>
        </>) : <tr><th>Terrain</th><td>SRTM unavailable — slope class used: {result.slope}</td></tr>}
        {c ? (<>
          <tr><th>Grown nearby ({c.neighbourhood_year})</th><td>{near || "—"}</td></tr>
          {c.detected && <tr><th>Detected rotation</th><td>{c.detected.rotation.map((y) => shortName(crops, y.main)).join(" → ")} ({Math.round(c.detected.agreement * 100)}% fit)</td></tr>}
        </>) : <tr><th>Crop history</th><td>USDA Cropland Data Layer covers the contiguous USA only.</td></tr>}
      </tbody></table>
      {c && (<>
        <div className="hint">Crop at this exact field each year (30 m satellite classification):</div>
        <div className="histrow">{c.history.map((h) => <span className="yr" key={h.year}><b>{h.year}</b>{h.crop_id ? SHORT[h.crop_id] || h.category : h.category}</span>)}</div>
      </>)}
      <p className="hint">On the map: brown squares are SRTM slope zones around the field (darker = steeper); dots are crops grown nearby in the latest USDA Cropland Data Layer.</p>
    </article>
  );
}

export function ConfidencePanel({ result }) {
  const cf = result.data_confidence;
  if (!cf) return (
    <article className="card"><h3>Can we trust the climate data? <span className="pill no">no second source</span></h3>
      <p className="hint">ERA5 could not be reached, so NASA POWER could not be cross-checked.</p></article>);
  const m = result.climate.monthly;
  const data = { labels: m.map((r) => r.month), datasets: [
    lineSeries("NASA POWER rain (mm)", m.map((r) => r.precip_mm), cssVar("--series-1")),
    lineSeries("ERA5 rain (mm)", cf.monthly_era5.map((r) => r.precip_mm), cssVar("--series-2"), { borderDash: [5, 4] }),
  ] };
  return (
    <article className="card">
      <h3>Can we trust the climate data? <span className={`pill conf-${cf.confidence}`}>{cf.confidence} confidence</span></h3>
      <div className="chart-box"><Line data={data} options={baseOptions("mm per month", { y: { beginAtZero: true } })} /></div>
      <p className="hint">Yearly rain: {cf.annual_precip_power_mm} mm (NASA POWER) vs {cf.annual_precip_era5_mm} mm (ERA5), {signed(cf.annual_precip_diff_pct, 1)}%;
        temperature difference {signed(cf.temp_bias_c, 2)} °C{cf.year_to_year_correlation != null && `; year-to-year agreement r = ${cf.year_to_year_correlation}`}. {cf.explanation}</p>
    </article>
  );
}
