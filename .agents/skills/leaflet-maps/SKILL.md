---
name: leaflet-maps
description: Leaflet and React-Leaflet integration patterns for Aaspass interactive map view, custom marker icons, popup previews, and responsive mobile map handling.
---

# Leaflet & Hyperlocal Maps Skill — Aaspass

## When to Use
Load this skill when working on `MapPage.tsx`, geolocation tracking, map markers, bounding box listeners, or custom popup cards.

---

## 1. Setup & Leaflet Asset Pitfalls

### CSS Requirement
Ensure `leaflet/dist/leaflet.css` is imported in `src/main.tsx` or root component to prevent broken tile layouts.

### Default Leaflet Icon Fix
Vite bundling can break standard Leaflet marker icon asset paths. Always define custom or SVG DivIcons:

```tsx
import L from "leaflet";

export function createCustomMarkerIcon(emoji: string, isService: boolean) {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white ${
        isService ? 'bg-sky-500' : 'bg-orange-500'
      } text-lg transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform">
        <span>${emoji || '📍'}</span>
        <div class="absolute -bottom-1 w-2 h-2 rotate-45 ${
          isService ? 'bg-sky-500' : 'bg-orange-500'
        }"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}
```

---

## 2. React-Leaflet Map Component Structure

```tsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { Link } from "react-router-dom";

// Component to dynamically re-center when user coordinates update
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function HyperlocalMap({ userLat, userLng, listings }: { userLat: number; userLng: number; listings: any[] }) {
  const center: [number, number] = [userLat, userLng];

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-xl overflow-hidden shadow-inner border border-border">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <ChangeView center={center} zoom={14} />
        
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        <Marker
          position={center}
          icon={L.divIcon({
            className: "user-loc-dot",
            html: '<div class="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-300 animate-pulse"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>You are here</Popup>
        </Marker>

        {/* Nearby Listing Pins */}
        {listings.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={createCustomMarkerIcon(item.emoji, item.type === 'service')}
          >
            <Popup className="custom-listing-popup">
              <div className="p-1 max-w-[200px]">
                <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.area}</p>
                <Link
                  to={`/listing/${item.id}`}
                  className="mt-2 block text-xs text-primary font-medium hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

---

## 3. Mobile Performance & Gestures

- Add `touchZoom={true}` and ensure tap events close active popups on mobile.
- For smooth touch panning on smartphones, disable body scroll interference while dragging the map.
