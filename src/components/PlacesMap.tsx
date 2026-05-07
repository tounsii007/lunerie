import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import type { Place } from '@/domain/models';
import { MAP_DEFAULT_ZOOM } from '@/constants/app';

interface PlacesMapProps {
  places: Place[];
  height?: number;
  onSelectPlace?: (place: Place) => void;
}

export function PlacesMap({ places, height = 260, onSelectPlace }: PlacesMapProps) {
  const center = places[0]?.coordinates ?? { latitude: 36.8065, longitude: 10.1815 };

  return (
    <div style={{ height, borderRadius: 28, overflow: 'hidden', border: '1px solid var(--app-border)' }}>
      <MapContainer center={[center.latitude, center.longitude]} zoom={MAP_DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place) => (
          <CircleMarker
            key={place.id}
            center={[place.coordinates.latitude, place.coordinates.longitude]}
            radius={8}
            pathOptions={{ color: '#f59e0b', fillColor: '#38bdf8', fillOpacity: 0.85 }}
            eventHandlers={
              onSelectPlace
                ? {
                    click: () => onSelectPlace(place),
                  }
                : undefined
            }
          >
            <Popup>
              <strong>{place.name}</strong>
              <div>{place.city}, {place.countryName}</div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
