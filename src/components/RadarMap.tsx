import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Flight, Airport, MapTileProvider } from '../types/flight';
import { INDONESIAN_AIRPORTS } from '../data/airports';
import { getAltitudeColor } from '../utils/aviation';

interface RadarMapProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
  selectedAirport: Airport | null;
  onSelectAirport: (airport: Airport) => void;
  tileProvider: MapTileProvider;
  showRadarSweep: boolean;
  showRangeRings: boolean;
  showAirports: boolean;
  followSelected: boolean;
}

const TILE_URLS: Record<MapTileProvider, { url: string; attribution: string }> = {
  'dark-radar': {
    url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; DeLorme, NAVTEQ',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  'aviation-light': {
    url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

// Generates an SVG string for an aircraft marker oriented at 0° (pointing up)
function createPlaneSvg(color: string, isSelected: boolean, size: number = 30): string {
  const stroke = isSelected ? '#ffffff' : '#0f172a';
  const strokeWidth = isSelected ? 2.5 : 1.2;
  const filter = isSelected ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))';

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" style="filter: ${filter};">
      <path
        d="M24 2 C22.5 2 21 3.5 21 6 L21 18 L6 26 L6 30 L21 26 L21 38 L15 42 L15 45 L24 43 L33 45 L33 42 L27 38 L27 26 L42 30 L42 26 L27 18 L27 6 C27 3.5 25.5 2 24 2 Z"
        fill="${color}"
        stroke="${stroke}"
        stroke-width="${strokeWidth}"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

export const RadarMap: React.FC<RadarMapProps> = ({
  flights,
  selectedFlight,
  onSelectFlight,
  selectedAirport,
  onSelectAirport,
  tileProvider,
  showRadarSweep,
  showRangeRings,
  showAirports,
  followSelected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const flightMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const airportMarkersRef = useRef<L.Marker[]>([]);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const rangeCirclesRef = useRef<L.Circle[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centered on Indonesia (approx Lat -2.5, Lon 118.0)
    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
    });

    // Custom zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    const config = TILE_URLS[tileProvider];
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when tileProvider changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const config = TILE_URLS[tileProvider];
    tileLayerRef.current = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapRef.current);
  }, [tileProvider]);

  // Render Indonesian Airport markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous airport markers
    airportMarkersRef.current.forEach((m) => m.remove());
    airportMarkersRef.current = [];

    if (!showAirports) return;

    INDONESIAN_AIRPORTS.forEach((airport) => {
      const isSelected = selectedAirport?.iata === airport.iata;
      const html = `
        <div class="flex items-center space-x-1 px-1.5 py-0.5 rounded shadow-lg border cursor-pointer transition-all transform hover:scale-110 ${
          isSelected
            ? 'bg-sky-500 text-white border-white ring-2 ring-sky-300'
            : 'bg-slate-900/90 text-sky-300 border-sky-500/30 hover:border-sky-400'
        }">
          <span class="text-[10px] font-bold tracking-wider">${airport.iata}</span>
          <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-sky-400'}"></span>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'custom-airport-icon',
        iconSize: [44, 22],
        iconAnchor: [22, 11],
      });

      const marker = L.marker([airport.lat, airport.lon], { icon })
        .addTo(mapRef.current!)
        .on('click', () => {
          onSelectAirport(airport);
        });

      marker.bindTooltip(
        `<div class="p-1 font-sans">
          <div class="font-bold text-sky-400">${airport.iata} / ${airport.icao}</div>
          <div class="text-xs text-slate-200">${airport.name}</div>
          <div class="text-[11px] text-slate-400">${airport.city}, ${airport.country}</div>
        </div>`,
        { direction: 'top', className: 'radar-tooltip' }
      );

      airportMarkersRef.current.push(marker);
    });
  }, [showAirports, selectedAirport, onSelectAirport]);

  // Update Flight Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentMarkerIds = new Set<string>();

    flights.forEach((flight) => {
      currentMarkerIds.add(flight.id);
      const isSelected = selectedFlight?.id === flight.id;
      const color = getAltitudeColor(flight.altitudeFt);
      const size = isSelected ? 36 : 28;

      const html = `
        <div style="width: ${size}px; height: ${size}px; transform: rotate(${flight.heading}deg); transform-origin: center center; transition: transform 0.5s linear;">
          ${createPlaneSvg(color, isSelected, size)}
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'custom-flight-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      let marker = flightMarkersRef.current.get(flight.id);
      if (marker) {
        marker.setLatLng([flight.lat, flight.lon]);
        marker.setIcon(icon);
      } else {
        marker = L.marker([flight.lat, flight.lon], { icon }).addTo(map);
        marker.on('click', () => {
          onSelectFlight(flight);
        });
        flightMarkersRef.current.set(flight.id, marker);
      }

      // Tooltip on hover
      marker.unbindTooltip();
      marker.bindTooltip(
        `<div class="p-1 text-xs font-mono-radar">
          <div class="font-bold text-white flex items-center justify-between space-x-2">
            <span>${flight.flightNumber}</span>
            <span class="text-[10px] px-1 rounded bg-slate-800 text-sky-300">${flight.aircraft.code}</span>
          </div>
          <div class="text-slate-300 text-[11px]">${flight.origin.iata} &rarr; ${flight.destination.iata}</div>
          <div class="text-[10px] text-amber-300 font-semibold mt-0.5">
            ${flight.altitudeFt.toLocaleString()} FT &bull; ${flight.groundSpeedKnots} KTS
          </div>
        </div>`,
        {
          direction: 'right',
          offset: [12, 0],
          className: 'radar-flight-tooltip',
        }
      );
    });

    // Remove obsolete flight markers
    for (const [id, marker] of flightMarkersRef.current.entries()) {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        flightMarkersRef.current.delete(id);
      }
    }
  }, [flights, selectedFlight, onSelectFlight]);

  // Handle selected flight flight-path & trail polyline
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove existing polylines
    if (trailPolylineRef.current) {
      trailPolylineRef.current.remove();
      trailPolylineRef.current = null;
    }
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (selectedFlight) {
      // 1. Draw scheduled route line (dashed grey/cyan line)
      const routeCoords: [number, number][] = [
        [selectedFlight.origin.lat, selectedFlight.origin.lon],
        [selectedFlight.lat, selectedFlight.lon],
        [selectedFlight.destination.lat, selectedFlight.destination.lon],
      ];

      routePolylineRef.current = L.polyline(routeCoords, {
        color: '#0284c7',
        weight: 2,
        dashArray: '6, 8',
        opacity: 0.6,
      }).addTo(map);

      // 2. Draw actual breadcrumb trail history with solid colored line
      if (selectedFlight.trail && selectedFlight.trail.length > 1) {
        const trailCoords: [number, number][] = selectedFlight.trail.map((t) => [t[0], t[1]]);
        // append current position
        trailCoords.push([selectedFlight.lat, selectedFlight.lon]);

        const trailColor = getAltitudeColor(selectedFlight.altitudeFt);
        trailPolylineRef.current = L.polyline(trailCoords, {
          color: trailColor,
          weight: 3.5,
          opacity: 0.85,
        }).addTo(map);
      }

      // Auto-follow if enabled
      if (followSelected) {
        map.panTo([selectedFlight.lat, selectedFlight.lon], { animate: true, duration: 1 });
      }
    }
  }, [selectedFlight, followSelected]);

  // Handle Range rings centered around selected flight or airport
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear old rings
    rangeCirclesRef.current.forEach((c) => c.remove());
    rangeCirclesRef.current = [];

    if (!showRangeRings) return;

    let centerLat = -2.5;
    let centerLon = 118.0;

    if (selectedFlight) {
      centerLat = selectedFlight.lat;
      centerLon = selectedFlight.lon;
    } else if (selectedAirport) {
      centerLat = selectedAirport.lat;
      centerLon = selectedAirport.lon;
    } else {
      // center on Jakarta Soekarno-Hatta if none selected
      centerLat = -6.1256;
      centerLon = 106.6558;
    }

    // 1 nautical mile = 1852 meters
    const ringsNm = [25, 50, 100, 150];
    ringsNm.forEach((nm) => {
      const circle = L.circle([centerLat, centerLon], {
        radius: nm * 1852,
        color: '#06b6d4',
        weight: 1,
        dashArray: '4, 6',
        opacity: 0.35,
        fill: false,
      }).addTo(map);
      rangeCirclesRef.current.push(circle);
    });
  }, [showRangeRings, selectedFlight, selectedAirport]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Radar Sweep Effect Overlay */}
      {showRadarSweep && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center">
          <div
            className="w-[1800px] h-[1800px] rounded-full animate-radar-sweep opacity-20"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(6, 182, 212, 0.4) 0deg, rgba(6, 182, 212, 0) 60deg, transparent 360deg)',
            }}
          />
        </div>
      )}
    </div>
  );
};
