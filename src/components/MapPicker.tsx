import { Fragment } from 'react';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MapContainer, TileLayer, Rectangle, CircleMarker, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { REGIONS } from '../lib/catalog';
import type { Variable } from '../lib/catalog';
import type { RegionTrend } from '../lib/regionTrends';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  /** Dim regions of the other type */
  filter: 'all' | 'land' | 'ocean';
  trends: Record<string, RegionTrend> | null;
  variable: Variable;
}

const RISING = '#ff7043';
const FALLING = '#42a5f5';
const NEUTRAL = '#b0bec5';

const fmt = (v: number) => {
  const a = Math.abs(v);
  return (v < 0 ? '-' : '+') + (a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a >= 0.1 ? a.toFixed(2) : a.toFixed(3));
};

// Whole world on first load; panning is kept inside the map so no empty grey area shows.
const WORLD_VIEW: LatLngBoundsExpression = [
  [-85, -180],
  [85, 180],
];

/** Fit the whole world to the map's width and keep it from zooming out further. */
function FitWorld() {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      const z = map.getBoundsZoom([[-60, -180], [85, 180]], false);
      map.setMinZoom(z);
      if (map.getZoom() < z) map.setZoom(z);
    };
    map.setView([22, 0], map.getBoundsZoom([[-60, -180], [85, 180]], false));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [map]);
  return null;
}

export default function MapPicker({ selectedId, onSelect, filter, trends, variable }: Props) {
  return (
    <MapContainer
      center={[22, 10]}
      zoom={1.25}
      minZoom={1}
      maxBounds={WORLD_VIEW}
      maxBoundsViscosity={1}
      zoomSnap={0.25}
      zoomDelta={0.5}
      className="map"
    >
      <FitWorld />
      {/* NASA GIBS Blue Marble base layer: Earth imagery */}
      <TileLayer
        url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg"
        attribution="Imagery &copy; NASA GIBS / Blue Marble"
        maxNativeZoom={8}
      />
      {REGIONS.map((r) => {
        const [s, w, n, e] = r.bbox;
        const bounds: LatLngBoundsExpression = [
          [s, w],
          [n, e],
        ];
        const active = r.id === selectedId;
        const hasData = variable.regionTypes.includes(r.type);
        const t = trends?.[r.id];
        const dimmed = filter !== 'all' && r.type !== filter && !active;

        let colour = NEUTRAL;
        let fillOpacity = 0.3;
        let label = `${r.name}: no clear trend`;
        let dashed = false;

        if (!hasData || !t) {
          fillOpacity = 0;
          dashed = true;
          label = `${r.name}: no ${variable.name.toLowerCase()} data`;
        } else if (t.sig) {
          colour = t.perDecade > 0 ? RISING : FALLING;
          fillOpacity = Math.min(0.75, 0.4 + (Math.abs(t.z) / 8) * 0.35);
          label = `${r.name}: ${fmt(t.perDecade)} ${variable.unit} per decade`;
        }
        const opacity = dimmed ? 0.25 : 1;
        const key = `${r.id}-${filter}-${active}-${variable.id}-${t ? t.z.toFixed(2) : 'x'}`;

        return (
          <Fragment key={key}>
            <Rectangle
              bounds={bounds}
              pathOptions={{
                color: active ? '#ffd23f' : colour,
                weight: active ? 3 : 1.5,
                fillColor: colour,
                fillOpacity: dimmed ? 0.03 : fillOpacity * 0.6,
                opacity,
                dashArray: dashed ? '4 4' : undefined,
              }}
              eventHandlers={{ click: () => onSelect(r.id) }}
            />
            {/* Dot at the centre so small boxes stay visible and easy to click */}
            <CircleMarker
              center={[(s + n) / 2, (w + e) / 2]}
              radius={active ? 10 : 8}
              pathOptions={{
                color: active ? '#ffd23f' : '#0b1626',
                weight: active ? 3 : 1.5,
                fillColor: colour,
                fillOpacity: dimmed ? 0.15 : dashed ? 0.15 : 0.95,
                opacity: dimmed ? 0.3 : 1,
              }}
              eventHandlers={{ click: () => onSelect(r.id) }}
            >
              <Tooltip sticky>{label}</Tooltip>
            </CircleMarker>
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
