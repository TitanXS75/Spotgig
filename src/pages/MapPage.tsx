import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LocateFixed, MapPin, Navigation } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';
import { DEFAULT_LAT, DEFAULT_LNG, getDistance } from '@/lib/distance';

// Fix Leaflet default marker icons under Vite bundling.
// (Without this, markers often render as missing images.)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function RecenterOnLocation({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, map, zoom]);

  return null;
}

const MapPage = () => {
  const navigate = useNavigate();
  const [isLocating, setIsLocating] = useState(false);

  const {
    userLat,
    userLng,
    hasLocation,
    searchQuery,
    selectedCategory,
    typeFilter,
    distanceFilter,
    sortBy,
    setUserLocation,
    userListings,
  } = useAppStore();

  const center = useMemo<[number, number]>(() => {
    if (hasLocation && Number.isFinite(userLat) && Number.isFinite(userLng)) return [userLat, userLng];
    // Default to Center of India
    return [20.5937, 78.9629];
  }, [userLat, userLng, hasLocation]);

  const listingsForMap = useMemo(() => {
    let items = userListings.filter((l) => l.status === 'live' && !l.hide_location);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.seller_name.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      items = items.filter((l) => l.category === selectedCategory);
    }
    if (typeFilter !== 'all') {
      items = items.filter((l) => l.type === typeFilter);
    }

    // Distance filter requires a reference point; if user denied location we still have defaults.
    if (distanceFilter > 0) {
      items = items.filter((l) => getDistance(center[0], center[1], l.lat, l.lng) <= distanceFilter);
    }

    if (sortBy === 'distance') {
      items = items
        .map((l) => ({ listing: l, distance: getDistance(center[0], center[1], l.lat, l.lng) }))
        .sort((a, b) => a.distance - b.distance)
        .map((x) => x.listing);
    } else {
      items = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return items;
  }, [center, distanceFilter, searchQuery, selectedCategory, sortBy, typeFilter]);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 }
    );
  };

  // Previously auto-requested. Now user must explicitly click the prompt.

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 pb-5"
      >
        <h1 className="text-subhead text-foreground">Map View</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See sellers near you on a map
          {!hasLocation && (
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Using default location
            </span>
          )}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border border-border bg-card overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background/40">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="tabular-nums">
              {listingsForMap.length} seller{listingsForMap.length === 1 ? '' : 's'}
            </span>
            {distanceFilter > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full">
                Within {distanceFilter}km
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={requestLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/70 text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
            title="Use my current location"
          >
            {isLocating ? <Navigation className="w-4 h-4 animate-pulse" /> : <LocateFixed className="w-4 h-4" />}
            {isLocating ? 'Locating…' : 'Locate me'}
          </button>
        </div>

        {/* Map */}
        <div className="relative">
          <div className="h-[calc(100vh-260px)] min-h-[420px] w-full">
            <MapContainer
              center={center}
              zoom={hasLocation ? 14 : 5}
              scrollWheelZoom
              className="h-full w-full"
            >
              <RecenterOnLocation center={center} zoom={hasLocation ? 14 : 5} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User marker */}
              <Marker position={center}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">You</div>
                    <div className="text-muted-foreground">
                      {hasLocation ? 'Current location' : 'Approximate region'}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {listingsForMap.map((listing) => {
                const distanceKm = getDistance(center[0], center[1], listing.lat, listing.lng);
                return (
                  <Marker key={listing.id} position={[listing.lat, listing.lng]}>
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{listing.emoji}</span>
                          <div className="font-semibold">{listing.name}</div>
                        </div>
                        <div className="text-muted-foreground mt-1">{listing.area}</div>
                        <div className="text-muted-foreground mt-1 tabular-nums">{distanceKm} km away</div>
                        <button
                          type="button"
                          onClick={() => navigate(`/listing/${listing.slug || listing.id}`)}
                          className="mt-2 inline-flex items-center justify-center w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                        >
                          View details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {!navigator.geolocation && (
            <div className="absolute top-3 left-3 right-3 md:left-auto md:right-3 md:w-[420px] rounded-2xl bg-background/90 backdrop-blur border border-border px-3 py-2 text-xs text-muted-foreground z-[1000]">
              Your browser doesn’t support geolocation, so the map is using the default location.
            </div>
          )}

          {!hasLocation && navigator.geolocation && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
              <button 
                onClick={requestLocation} 
                disabled={isLocating}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-transform active:scale-95 animate-bounce disabled:animate-none disabled:opacity-75"
              >
                {isLocating ? <Navigation className="w-5 h-5 animate-pulse" /> : <LocateFixed className="w-5 h-5" />}
                {isLocating ? 'Detecting Location...' : 'Detect My Location'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MapPage;
