import { MapContainer, TileLayer, Rectangle, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { REGIONS } from '../lib/catalog';
import type { Variable } from '../lib/catalog';
import type { RegionTrend } from '../lib/regionTrends';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  /** Highlight only regions of this type; others are dimmed */
  filter: 'all' | 'land' | 'ocean';
  /** 'trend' colours each box by the trend of the chosen variable; 'category' by land/ocean */
  mode: 'category' | 'trend';
  trends: Record<string, RegionTrend> | null;
  variable: Variable;
}

const CATEGORY = {
  land: { base: '#4caf50', light: '#a5f0a8' },
  ocean: { base: '#2196f3', light: '#9bd3ff' },
};
const RISING = '#ff7043';
const FALLING = '#42a5f5';
const NEUTRAL = '#9e9e9e';

const fmt = (v: number) => {
  const a = Math.abs(v);
  return (v < 0 ? '-' : '+') + (a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a >= 1 ? a.toFixed(2) : a.toFixed(3));
};

export default function MapPicker({ selectedId, onSelect, filter, mode, trends, variable }: Props) {
  return (
    <MapContainer center={[25, 10]} zoom={2} minZoom={2} worldCopyJump className="map">
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

        let fill: string;
        let outline: string;
        let fillOpacity: number;
        let opacity = 1;
        let label = r.name;

        if (mode === 'trend') {
          if (!hasData || !t) {
            fill = outline = NEUTRAL;
            fillOpacity = 0.04;
            opacity = 0.35;
            label = `${r.name}: no ${variable.name.toLowerCase()} data`;
          } else if (!t.sig) {
            fill = outline = NEUTRAL;
            fillOpacity = 0.25;
            label = `${r.name}: no clear trend`;
          } else {
            fill = outline = t.z > 0 ? RISING : FALLING;
            fillOpacity = Math.min(0.7, 0.3 + (Math.abs(t.z) / 8) * 0.4);
            label = `${r.name}: ${fmt(t.perDecade)} ${variable.unit} per decade`;
          }
          if (active) outline = '#ffd23f';
        } else {
          const dim = filter !== 'all' && r.type !== filter && !active;
          const c = CATEGORY[r.type];
          fill = active ? c.light : c.base;
          outline = fill;
          fillOpacity = active ? 0.6 : dim ? 0.05 : 0.3;
          opacity = dim ? 0.3 : 1;
        }
        if (mode === 'trend' && filter !== 'all' && r.type !== filter && !active) opacity = Math.min(opacity, 0.3);

        return (
          <Rectangle
            key={`${r.id}-${mode}-${filter}-${active}-${t ? t.z.toFixed(2) : 'x'}-${variable.id}`}
            bounds={bounds}
            pathOptions={{ color: outline, weight: active ? 4 : 2, fillColor: fill, fillOpacity, opacity }}
            eventHandlers={{ click: () => onSelect(r.id) }}
          >
            <Tooltip sticky>{label}</Tooltip>
          </Rectangle>
        );
      })}
    </MapContainer>
  );
}
