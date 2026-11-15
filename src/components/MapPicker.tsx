import { MapContainer, TileLayer, Rectangle, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { REGIONS } from '../lib/catalog';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function MapPicker({ selectedId, onSelect }: Props) {
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
        return (
          <Rectangle
            key={r.id}
            bounds={bounds}
            pathOptions={{
              color: active ? '#ffd23f' : '#ffffff',
              weight: active ? 3 : 2,
              fillOpacity: active ? 0.35 : 0.15,
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
