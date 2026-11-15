import { FLAG_INFO, SHORT, stratColors, stratName } from "../lib.js";

export default function FieldCalendar({ result, crops }) {
  const cols = stratColors();
  return (
    <article className="card">
      <h3>Field calendar <span className="hint">— what covers the soil each month, and when crops are vulnerable</span></h3>
      <div className="legend">
        <span><i className="lg" style={{ background: "var(--main-crop)" }} />Main crop</span>
        <span><i className="lg" style={{ background: "var(--cover-crop)" }} />Cover crop</span>
        <span><i className="lg cell bare" style={{ height: 14 }} />Bare soil</span>
        <span><i className="lg" style={{ background: "var(--main-crop)", opacity: 0.55 }} />Sowing / establishing</span>
        {Object.entries(FLAG_INFO).map(([k, [sym, cls, txt]]) => <span key={k}><b className={cls}>{sym}</b>{txt}</span>)}
      </div>
      {result.strategies.map((s, si) => {
        const fc = s.calendar.flag_counts;
        return (
          <div className="cal" key={si}>
            <div className="cal-title"><span className="swatch" style={{ background: cols[si] }} />{stratName(si)}: {s.explanation.label}
              <span className="pill muted">bare {Math.round(s.calendar.bare_fraction * 100)}% · erosion-risk months {fc.bare_erosive}</span></div>
            <div className="cal-grid">
              <div />
              {result.season_month_labels.map((m) => <div className="mh" key={m}>{m}</div>)}
              {s.calendar.cells.flatMap((c, idx) => {
                const out = [];
                if (idx % 12 === 0) out.push(<div className="yl" key={`y${idx}`}>Year {c.year}</div>);
                const crop = c.crop ? crops[c.crop] : null;
                const cls = c.bare ? "bare" : `${c.role}${c.phase === "sow" ? " sow" : ""}`;
                const title = `${c.month}, year ${c.year}: ${c.crop_name ? `${c.crop_name} (${c.phase})` : "bare soil"}` +
                  (c.flags.length ? " — " + c.flags.map((f) => FLAG_INFO[f][2]).join("; ") : "");
                out.push(
                  <div key={idx} className={`cell ${cls}`} title={title} aria-label={title}>
                    {c.phase === "sow" || c.bare || !crop ? "" : SHORT[crop.id] || crop.name.slice(0, 7)}
                    <span className="flags">{c.flags.map((f) => <span key={f} className={FLAG_INFO[f][1]}>{FLAG_INFO[f][0]}</span>)}</span>
                  </div>);
                return out;
              })}
            </div>
          </div>
        );
      })}
    </article>
  );
}
