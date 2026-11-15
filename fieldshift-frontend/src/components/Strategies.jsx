import { useState } from "react";
import { Radar } from "react-chartjs-2";
import { cssVar, stratColors, stratName } from "../lib.js";

export function StrategyCards({ result, selected, onSelect }) {
  const cols = stratColors();
  const cur = result.strategies[0];
  return (
    <div className="strategy-grid">
      {result.strategies.map((s, i) => {
        const delta = s.overall - cur.overall;
        return (
          <div key={i} className={`scard ${i === selected ? "selected" : ""}`} role="button" tabIndex={0}
            onClick={() => onSelect(i)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(i)}>
            <div className="top">
              <div>
                <div className="theme">{stratName(i)} · {s.explanation.theme}</div>
                <div className="overall">{Math.round(s.overall)}<small> /100</small>
                  {i > 0 && <span className={`delta ${delta >= 0 ? "up" : "down"}`}> {delta >= 0 ? "+" : ""}{Math.round(delta)}</span>}
                </div>
              </div>
              <span className="swatch" style={{ background: cols[i] }} />
            </div>
            <div className="rot-label">{s.explanation.label}</div>
            <div className="bars">
              {Object.entries(s.scores).map(([k, v]) => (
                <div className="bar" key={k}><span>{result.metric_labels[k]}</span>
                  <div className="track"><div className="fill" style={{ width: `${v}%` }} /></div><b>{v}</b></div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ScoreRadar({ result }) {
  const cols = stratColors();
  const labels = Object.keys(result.strategies[0].scores).map((k) => result.metric_labels[k]);
  const data = {
    labels,
    datasets: result.strategies.map((s, i) => ({
      label: `${stratName(i)}: ${s.explanation.theme}`, data: Object.values(s.scores), borderColor: cols[i],
      backgroundColor: cols[i] + "18", borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, borderDash: i === 0 ? [5, 4] : [],
    })),
  };
  const options = {
    maintainAspectRatio: false,
    scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, backdropColor: "transparent" }, grid: { color: cssVar("--line") },
      angleLines: { color: cssVar("--line") }, pointLabels: { font: { size: 11 } } } },
    plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } },
  };
  const keys = Object.keys(result.strategies[0].scores);
  return (
    <article className="card">
      <h3>Scores side by side</h3>
      <div className="chart-box tall"><Radar data={data} options={options} aria-label="Radar chart comparing strategy scores" /></div>
      <details><summary>Table view</summary>
        <table className="simple"><thead><tr><th>Metric</th>{result.strategies.map((_, i) => <th key={i}>{stratName(i)}</th>)}</tr></thead>
          <tbody>
            {keys.map((k) => <tr key={k}><td>{result.metric_labels[k]}</td>{result.strategies.map((s, i) => <td key={i} className="n">{s.scores[k]}</td>)}</tr>)}
            <tr><td><b>Overall</b></td>{result.strategies.map((s, i) => <td key={i} className="n"><b>{Math.round(s.overall)}</b></td>)}</tr>
            <tr><td>Crop water use (mm/yr)</td>{result.strategies.map((s, i) => <td key={i} className="n">{s.water_use_mm_per_year}</td>)}</tr>
            <tr><td>Bare-soil time</td>{result.strategies.map((s, i) => <td key={i} className="n">{Math.round(s.calendar.bare_fraction * 100)}%</td>)}</tr>
          </tbody></table>
      </details>
    </article>
  );
}

const TABS = [["why", "Why suggested"], ["evidence", "Evidence"], ["benefits", "Benefits"],
  ["information_gaps", "Information gaps"], ["risks", "Risks to review"]];

export function StrategyDetail({ result, selected }) {
  const [tab, setTab] = useState("why");
  const s = result.strategies[selected];
  const items = s.explanation[tab] || [];
  return (
    <article className="card">
      <h3>{stratName(selected)} — {s.explanation.label}</h3>
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} className="tab" role="tab" aria-selected={k === tab} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      <div className="detail-body">
        {items.length ? <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="hint">Nothing to show.</p>}
      </div>
    </article>
  );
}
