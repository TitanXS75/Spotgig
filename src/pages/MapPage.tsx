import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MapPin, ExternalLink } from 'lucide-react';
import { MOCK_LISTINGS, type Listing } from '@/lib/mock-data';
import { useAppStore } from '@/store/app-store';

// Fix Leaflet default marker icons broken by Vite's asset pipeline
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom coloured marker creator
const makeIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.25);
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });

const productIcon = makeIcon('#22c55e');  // green
const serviceIcon = makeIcon('#3b82f6');  // blue
const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#6366f1;border:3px solid #fff;
    box-shadow:0 0 0 3px rgba(99,102,241,.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to fly-to user location when it becomes available
const FlyToUser = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  const fired = useRef(false);
  useEffect(() => {
    if (lat !== 21.1458 && !fired.current) {
      map.flyTo([lat, lng], 14, { duration: 1.5 });
      fired.current = true;
    }
  }, [lat, lng, map]);
  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const { userLat, userLng, hasLocation, setUserLocation } = useAppStore();
  const [selected, setSelected] = useState<Listing | null>(null);
  const [filter, setFilter] = useState<'all' | 'product' | 'service'>('all');

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [setUserLocation]);

  const listings = MOCK_LISTINGS.filter(
    (l) => l.status === 'live' && (filter === 'all' || l.type === filter)
  );

  const center: [number, number] = [userLat, userLng];

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-background border-b border-border z-10">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground mr-2">Show:</span>
        {(['all', 'product', 'service'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f === 'all' ? 'All sellers' : f === 'product' ? '📦 Products' : '🛠️ Services'}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{listings.length} visible</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-background/90 text-xs text-muted-foreground border-b border-border">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-[#22c55e]" /> Product
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-[#3b82f6]" /> Service
        </span>
        {hasLocation && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#6366f1]" /> You
          </span>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={13}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FlyToUser lat={userLat} lng={userLng} />

          {/* User location dot */}
          {hasLocation && (
            <Marker position={[userLat, userLng]} icon={userIcon}>
              <Popup>
                <span className="text-xs font-medium">📍 You are here</span>
              </Popup>
            </Marker>
          )}

          {/* Seller markers */}
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={listing.type === 'product' ? productIcon : serviceIcon}
              eventHandlers={{ click: () => setSelected(listing) }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <p className="font-semibold text-sm leading-tight">{listing.emoji} {listing.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{listing.area}</p>
                  <p className="text-xs mt-1 line-clamp-2 text-gray-600">{listing.description}</p>
                  <button
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1 hover:underline"
                  >
                    View listing <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bottom panel — selected listing */}
      {selected && (
        <motion.div
          key={selected.id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:max-w-sm z-[1000] bg-background rounded-t-2xl md:rounded-2xl shadow-2xl border border-border p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selected.emoji}</span>
              <div>
                <p className="font-semibold text-foreground text-sm leading-tight">{selected.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.seller_name} · {selected.area}</p>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                  selected.type === 'product'
                    ? 'text-green-600 bg-green-50'
                    : 'text-blue-600 bg-blue-50'
                }`}>
                  {selected.type}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground text-lg leading-none mt-0.5 shrink-0"
            >
              ×
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{selected.description}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate(`/listing/${selected.id}`)}
              className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg"
            >
              View Listing
            </button>
            {selected.whatsapp && (
              <a
                href={`https://wa.me/${selected.whatsapp}?text=Hi! I found you on Aaspass. I'm interested in ${selected.name}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 bg-muted text-foreground text-xs font-medium rounded-lg"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </a>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MapPage;
