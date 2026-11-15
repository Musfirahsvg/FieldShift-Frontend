import { useEffect } from "react";
import L from "leaflet";
import { CircleMarker, LayersControl, MapContainer, Marker, Rectangle, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { ZONE_COLOR, cssVar } from "../lib.js";

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Re-centres only when `view.key` changes (demo farm picked) and fits overlays when `fit.key` changes. */
function Recenter({ view, fit }) {
  const map = useMap();
  useEffect(() => {
    if (view) map.setView([view.lat, view.lon], view.zoom);
  }, [view?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (fit?.bounds?.length) map.fitBounds(fit.bounds, { padding: [12, 12] });
  }, [fit?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Satellite map: click to pick a field; shows SRTM slope zones and USDA CDL neighbour crops. */
export default function MapPicker({ lat, lon, view, onPick, terrain, cdl, crops, fitKey }) {
  const cells = terrain?.cells ?? [];
  const neigh = cdl?.neighbourhood ?? [];
  const fit = { key: fitKey, bounds: fitKey ? [...cells.flatMap((c) => c.bounds), ...neigh.map((n) => [n.lat, n.lon])] : [] };
  return (
    <MapContainer center={[lat, lon]} zoom={view?.zoom ?? 6} id="map" scrollWheelZoom>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Satellite">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Imagery © Esri" maxZoom={18} />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" maxZoom={18} />
        </LayersControl.BaseLayer>
      </LayersControl>
      <ClickHandler onPick={onPick} />
      <Recenter view={view} fit={fit} />
      <Marker position={[lat, lon]} />
      {cells.map((c, i) => (
        <Rectangle key={`t${i}`} bounds={c.bounds} pathOptions={{ color: ZONE_COLOR[c.zone], weight: 0, fillOpacity: 0.55 }}>
          <Tooltip>Elevation {c.elevation_m} m · slope {c.slope_pct}% ({c.zone})</Tooltip>
        </Rectangle>
      ))}
      {neigh.map((n, i) => (
        <CircleMarker key={`n${i}`} center={[n.lat, n.lon]} radius={6}
          pathOptions={{ color: "#fff", weight: 2, fillColor: n.crop_id && crops[n.crop_id] ? cssVar("--main-crop") : cssVar("--series-neutral"), fillOpacity: 1 }}>
          <Tooltip>{n.year}: {n.category}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
