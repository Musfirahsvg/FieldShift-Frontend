import { BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement,
  RadialLinearScale, Tooltip } from "chart.js";
import { cssVar } from "../lib.js";

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend);
ChartJS.defaults.font.family = "Inter, system-ui, sans-serif";

export const themeChart = () => {
  ChartJS.defaults.color = cssVar("--text-secondary");
  ChartJS.defaults.borderColor = cssVar("--line");
};

export const lineSeries = (label, data, color, extra = {}) => ({
  label, data, borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.3, ...extra,
});

export const baseOptions = (yTitle, extra = {}) => ({
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  scales: {
    y: { title: { display: !!yTitle, text: yTitle }, grid: { color: cssVar("--line") }, ...(extra.y || {}) },
    x: { grid: { display: false }, ...(extra.x || {}) },
  },
  plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } }, ...(extra.plugins || {}) },
});
