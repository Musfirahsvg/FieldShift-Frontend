import { Bar, Line } from "react-chartjs-2";
import { cssVar } from "../lib.js";
import { baseOptions, lineSeries } from "./charts.js";

export function ClimateTiles({ s }) {
  const tiles = [
    [`${Math.round(s.annual_precip_mm)} mm`, "Average yearly rain"],
    [`${Math.round(s.annual_et0_mm)} mm`, "Yearly crop water demand (ET₀)"],
    [s.aridity_class, `Climate class (rain ÷ ET₀ = ${s.aridity_index})`],
    [`${s.frost_free_days} days`, `Frost-free season (${s.last_spring_frost} → ${s.first_autumn_frost})`],
    [`${Math.round(s.gdd10_year)}`, "Growing degree days (base 10 °C)"],
    [`${s.heat_days_year}`, "Heat-stress days per year (>32 °C)"],
    [`${s.mean_annual_min_temp} °C`, "Typical coldest night of the year"],
    [s.years, `${s.n_years} years of daily data`],
  ];
  return <div className="tiles">{tiles.map(([v, k]) => <div className="tile" key={k}><div className="v">{v}</div><div className="k">{k}</div></div>)}</div>;
}

export function ClimateCharts({ monthly: m }) {
  const labels = m.map((r) => r.month);
  const water = { labels, datasets: [
    { type: "bar", label: "Rain (mm)", data: m.map((r) => r.precip_mm), backgroundColor: cssVar("--series-1"), borderRadius: 4, borderSkipped: "start", barPercentage: 0.7 },
    { type: "line", ...lineSeries("Crop water demand ET₀ (mm)", m.map((r) => r.et0_mm), cssVar("--series-2")) },
  ] };
  const temp = { labels, datasets: [
    lineSeries("Average max", m.map((r) => r.tmax), cssVar("--series-8")),
    lineSeries("Average", m.map((r) => r.tmean), cssVar("--series-neutral"), { borderDash: [4, 3] }),
    lineSeries("Average min", m.map((r) => r.tmin), cssVar("--series-1")),
  ] };
  return (
    <div className="grid2">
      <article className="card"><h3>Rain vs. crop water demand (ET₀)</h3>
        <div className="chart-box"><Bar data={water} options={baseOptions("mm per month", { y: { beginAtZero: true } })} /></div></article>
      <article className="card"><h3>Temperature</h3>
        <div className="chart-box"><Line data={temp} options={baseOptions("°C")} /></div></article>
    </div>
  );
}

function TrendCard({ t }) {
  const pd = t.per_decade;
  const fmt = Math.abs(pd) >= 10 ? pd.toFixed(0) : Math.abs(pd) >= 1 ? pd.toFixed(1) : pd.toFixed(3);
  const fit = t.years.map((_, k) => t.intercept + t.sen_slope * k);
  const data = { labels: t.years, datasets: [
    { label: t.label, data: t.series, borderColor: cssVar("--series-1"), borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 4, tension: 0.2 },
    { label: "Sen's slope trend", data: fit, borderColor: t.significant ? cssVar("--warn") : cssVar("--series-neutral"), borderWidth: 2, pointRadius: 0, borderDash: [4, 3] },
  ] };
  const options = { maintainAspectRatio: false, animation: false, interaction: { mode: "index", intersect: false },
    scales: { x: { display: false }, y: { display: false } }, plugins: { legend: { display: false } } };
  return (
    <div className="trend">
      <div className="t-head"><span>{t.label}</span><span className={`t-sig ${t.significant ? "sig" : "ns"}`}>{t.significant ? "significant" : "not significant"}</span></div>
      <div className="t-val">{pd >= 0 ? "+" : ""}{fmt} {t.unit} per decade <span className="hint">(p = {t.p_value.toFixed(3)})</span></div>
      <div style={{ height: 46 }}><Line data={data} options={options} aria-label={`${t.label} yearly values with trend line`} /></div>
    </div>
  );
}

export function TrendCards({ trends }) {
  return (
    <article className="card">
      <h3>Long-term trends <span className="hint">— Mann-Kendall test with Sen's slope</span></h3>
      <div className="trend-grid">{trends.map((t) => <TrendCard key={t.key} t={t} />)}</div>
    </article>
  );
}

export function NdviChart({ ndvi }) {
  if (!ndvi) return null;
  const data = { labels: ndvi.series.map((s) => s.date), datasets: [
    { label: "NDVI (16-day)", data: ndvi.series.map((s) => s.ndvi), borderColor: cssVar("--series-3"), backgroundColor: cssVar("--series-3"), borderWidth: 2, pointRadius: 2, tension: 0.25 },
  ] };
  return (
    <article className="card">
      <h3>Satellite greenness (MODIS NDVI)</h3>
      <p className="hint">Low values (&lt; 0.3) usually mean bare or harvested ground; high values mean dense, healthy crops.</p>
      <div className="chart-box"><Line data={data} options={baseOptions("NDVI", { y: { min: 0, max: 1 }, x: { ticks: { maxTicksLimit: 10 } }, plugins: { legend: { display: false } } })} /></div>
    </article>
  );
}
