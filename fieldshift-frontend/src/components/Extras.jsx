import { useState } from "react";
import { cssVar } from "../lib.js";

function SuitRow({ s }) {
  const [open, setOpen] = useState(false);
  const color = s.score >= 70 ? cssVar("--good") : s.score >= 45 ? cssVar("--warn") : cssVar("--bad");
  return (<>
    <div className="srow" role="button" tabIndex={0} title="Show reasons" onClick={() => setOpen(!open)} onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}>
      <span>{s.name}{s.grown_nearby && <span className="tag">grown nearby</span>}</span>
      <div className="track"><div className="fill" style={{ width: `${s.score}%`, background: color }} /></div><b>{s.score}</b>
    </div>
    {open && <div className="sreasons">{s.reasons.length ? s.reasons.map((r, i) => <div key={i} className={`lvl-${r.level}`}>{r.text}</div>) : "No issues found."}</div>}
  </>);
}

export function Suitability({ rows }) {
  return <article className="card"><h3>Crop suitability here</h3><div className="suit">{rows.map((s) => <SuitRow key={s.id} s={s} />)}</div></article>;
}

export function SoilCard({ soil: s, slope }) {
  const rows = [["Source", s.source], ["Map unit / component", [s.map_unit, s.component].filter(Boolean).join(" / ")],
    ["Texture", s.texture], ["Sand / clay", s.sand_pct != null ? `${s.sand_pct}% / ${s.clay_pct}%` : null],
    ["Organic matter", s.om_pct != null ? `${s.om_pct}%` : null], ["pH", s.ph], ["Drainage", s.drainage_class],
    ["Hydrologic group", s.hydrologic_group], ["Slope", s.slope_pct != null ? `${s.slope_pct}%` : null], ["Slope class used", slope]];
  return (
    <article className="card"><h3>Soil</h3>
      <table className="simple"><tbody>{rows.filter(([, v]) => v != null && v !== "").map(([k, v]) => <tr key={k}><th>{k}</th><td>{String(v)}</td></tr>)}</tbody></table>
      <p className="hint" style={{ marginTop: ".6rem" }}>Have a lab soil test? Add it under step 2 for more accurate results.</p>
    </article>
  );
}

export function Dialogs({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
        {open === "how" ? (<>
          <h2>How FieldShift works</h2>
          <ol>
            <li><b>Data.</b> NASA POWER daily climate since 2001 (GPM IMERG-corrected rain, MERRA-2 soil wetness), MODIS NDVI, USDA SSURGO / ISRIC SoilGrids soils, NASA SRTM terrain, the USDA Cropland Data Layer and ECMWF ERA5.</li>
            <li><b>Analysis.</b> Monthly normals, frost-free season, growing degree days, heat and frost days, reference evapotranspiration, Mann-Kendall trend tests and a POWER-vs-ERA5 confidence check.</li>
            <li><b>Suitability.</b> 26 crops and covers get a 0–100 score with plain-language reasons.</li>
            <li><b>Rotations.</b> Thousands of 2–4-year rotations are built, bare windows filled with cover crops, and each is scored on 8 measures weighted by your priorities.</li>
            <li><b>Explanation.</b> The best three distinct options are shown with why, evidence, benefits, information gaps and risks to review locally.</li>
          </ol>
          <p>FieldShift supports, but never replaces, farmer judgment and local agronomic advice.</p>
        </>) : (<>
          <h2>Glossary</h2>
          <dl>
            <dt>Evapotranspiration (ET / ET₀)</dt><dd>Water leaving the field by evaporation and plant transpiration. ET₀ is the demand of a well-watered reference grass — how thirsty the weather is.</dd>
            <dt>Climatic water balance</dt><dd>Rain minus ET₀. Negative months are when crops draw down soil water or need irrigation.</dd>
            <dt>Soil wetness (0–1)</dt><dd>NASA's modelled fraction of soil pore space filled with water; root-zone ≈ top metre.</dd>
            <dt>Soil-moisture anomaly</dt><dd>How much wetter or drier than normal the soil is for the time of year.</dd>
            <dt>NDVI</dt><dd>Satellite greenness index: about 0–0.2 bare soil, 0.3–0.5 sparse crop, 0.6+ dense green crop.</dd>
            <dt>GDD (growing degree days)</dt><dd>Accumulated warmth above a base temperature; crops need a certain total to mature.</dd>
            <dt>Frost-free season</dt><dd>Typical days between the last spring frost and first autumn frost (minimum ≤ 0 °C).</dd>
            <dt>Mann-Kendall test / Sen's slope</dt><dd>A robust test for a steady trend (p &lt; 0.05 = significant) and a robust estimate of its rate.</dd>
            <dt>Cover crop</dt><dd>A crop grown to protect and feed the soil rather than for sale.</dd>
            <dt>Satellite vs ground data</dt><dd>Satellites and models cover everywhere consistently but average over large areas; ground gauges are exact for one spot. Combining both is most accurate.</dd>
          </dl>
        </>)}
      </div>
    </div>
  );
}
