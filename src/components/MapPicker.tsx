import { MapContainer, TileLayer, Rectangle, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { REGIONS } from '../lib/catalog';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  /** Highlight only regions of this type; others are dimmed */
  filter: 'all' | 'land' | 'ocean';
}

// Land boxes are green, ocean boxes are blue. The selected one gets a lighter
// fill of the same hue and a thick bright outline.
const STYLE = {
  land: { base: '#4caf50', light: '#a5f0a8' },
  ocean: { base: '#2196f3', light: '#9bd3ff' },
};

export default function MapPicker({ selectedId, onSelect, filter }: Props) {
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
        const dim = filter !== 'all' && r.type !== filter && !active;
        const c = STYLE[r.type];
        return (
          <Rectangle
            key={`${r.id}-${filter}-${active}`}
            bounds={bounds}
            pathOptions={{
              color: active ? c.light : c.base,
              weight: active ? 4 : 2,
              fillColor: active ? c.light : c.base,
              fillOpacity: active ? 0.6 : dim ? 0.05 : 0.3,
              opacity: dim ? 0.3 : 1,
            }}
            eventHandlers={{ click: () => onSelect(r.id) }}
          >
            <Tooltip sticky>{r.name}</Tooltip>
          </Rectangle>
        );
      })}
    </MapContainer>
  );
}
