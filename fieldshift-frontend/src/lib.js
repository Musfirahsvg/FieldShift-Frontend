export const PRIORITIES = [
  ["water", "Save water"], ["nitrogen", "Build soil nitrogen"], ["erosion", "Reduce erosion"],
  ["organic_matter", "Build organic matter"], ["pest_break", "Break pest & disease cycles"],
  ["income", "Income / market value"], ["forage", "Forage for livestock"],
];

export const FLAG_INFO = {
  bare_erosive: ["▼", "f-erosive", "Bare soil during heavy-rain month (erosion risk)"],
  heat: ["▲", "f-heat", "Heat stress (days > 32 °C) while crop is growing"],
  frost: ["✱", "f-frost", "Frost risk for a frost-sensitive crop"],
  dry: ["◆", "f-dry", "Water deficit for a drought-sensitive crop"],
  wet: ["●", "f-wet", "Waterlogging risk"],
};

export const SHORT = {
  corn: "Corn", soybean: "Soy", winter_wheat: "W.wheat", spring_wheat: "S.wheat", barley: "Barley",
  oats: "Oats", sorghum: "Sorghum", cotton: "Cotton", sunflower: "Sunfl.", canola: "Rape", field_pea: "Pea",
  dry_beans: "Beans", chickpea: "Chickpea", lentil: "Lentil", potato: "Potato", sugar_beet: "Beet",
  proso_millet: "Millet", alfalfa: "Alfalfa", cereal_rye: "Rye", crimson_clover: "Crimson", hairy_vetch: "Vetch",
  red_clover: "Clover", tillage_radish: "Radish", buckwheat: "Buckwh.", cowpea: "Cowpea", sorghum_sudan: "Sor-sud",
  fallow: "Fallow",
};

export const ZONE_COLOR = { flat: "#f1dfbd", gentle: "#d39a5c", steep: "#86471c" };

export const cssVar = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
export const stratName = (i) => (i === 0 ? "Current" : `Option ${String.fromCharCode(64 + i)}`);
export const stratColors = () => [cssVar("--series-neutral"), cssVar("--series-1"), cssVar("--series-2"), cssVar("--series-3")];
export const shortName = (crops, id) => (crops[id]?.name || id).split(" (")[0];
export const signed = (v, d = 0) => `${v >= 0 ? "+" : ""}${Number(v).toFixed(d)}`;
