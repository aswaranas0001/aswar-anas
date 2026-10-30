import { Flight, FilterOptions, Airport } from '../types/flight';

/**
 * Calculates great circle distance between two points in kilometers using Haversine formula
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates initial true bearing/heading in degrees (0-359) from point A to point B
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let theta = Math.atan2(y, x);
  let bearing = (theta * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return Math.round(bearing);
}

/**
 * Converts altitude in feet to color code matching radar standards:
 * - 0 - 3,000 ft: Green / Lime (Takeoff, Approach, Ground)
 * - 3,000 - 15,000 ft: Emerald to Yellow (Climbing / Descending)
 * - 15,000 - 28,000 ft: Amber / Orange
 * - 28,000 - 36,000 ft: Cyan / Sky Blue (Standard Jet Cruise)
 * - 36,000+ ft: Indigo / Magenta (High Altitude Cruise)
 */
export function getAltitudeColor(altitudeFt: number): string {
  if (altitudeFt <= 1000) return '#10b981'; // Green (Ground / Initial climb)
  if (altitudeFt <= 5000) return '#84cc16'; // Lime
  if (altitudeFt <= 12000) return '#eab308'; // Yellow
  if (altitudeFt <= 24000) return '#f97316'; // Orange
  if (altitudeFt <= 34000) return '#06b6d4'; // Cyan
  if (altitudeFt <= 39000) return '#3b82f6'; // Blue
  return '#a855f7'; // Purple / High cruise FL400+
}

export function formatAltitude(altitudeFt: number, unit: 'ft' | 'm' = 'ft'): string {
  if (unit === 'm') {
    const meters = Math.round(altitudeFt * 0.3048);
    return `${meters.toLocaleString('id-ID')} m`;
  }
  return `${altitudeFt.toLocaleString('id-ID')} ft`;
}

export function formatSpeed(knots: number, unit: 'kts' | 'kmh' = 'kts'): string {
  if (unit === 'kmh') {
    const kmh = Math.round(knots * 1.852);
    return `${kmh} km/h`;
  }
  return `${knots} kts`;
}

/**
 * Formats vertical speed with climb/descent arrow
 */
export function formatVerticalSpeed(fpm: number): { text: string; indicator: 'up' | 'down' | 'level' } {
  if (Math.abs(fpm) < 80) {
    return { text: '0 fpm', indicator: 'level' };
  }
  if (fpm > 0) {
    return { text: `+${fpm.toLocaleString('id-ID')} fpm`, indicator: 'up' };
  }
  return { text: `${fpm.toLocaleString('id-ID')} fpm`, indicator: 'down' };
}

/**
 * Interpolates a flight position along the arc between origin and destination
 */
export function interpolateArcPosition(
  origin: { lat: number; lon: number },
  dest: { lat: number; lon: number },
  progress: number // 0 to 1
): { lat: number; lon: number } {
  const p = Math.max(0, Math.min(1, progress));
  // Spherical linear interpolation approximation
  const lat = origin.lat + (dest.lat - origin.lat) * p;
  const lon = origin.lon + (dest.lon - origin.lon) * p;
  return { lat, lon };
}

/**
 * Filter flights by user search term, airline, altitude range, and status
 */
export function filterFlights(flights: Flight[], options: FilterOptions): Flight[] {
  const q = options.query.trim().toLowerCase();

  return flights.filter((flight) => {
    // 1. Text search
    if (q) {
      const matchCallsign = flight.callsign.toLowerCase().includes(q);
      const matchFlightNum = flight.flightNumber.toLowerCase().includes(q);
      const matchAirline = flight.airline.name.toLowerCase().includes(q);
      const matchOrigin =
        flight.origin.iata.toLowerCase().includes(q) ||
        flight.origin.city.toLowerCase().includes(q) ||
        flight.origin.name.toLowerCase().includes(q);
      const matchDest =
        flight.destination.iata.toLowerCase().includes(q) ||
        flight.destination.city.toLowerCase().includes(q) ||
        flight.destination.name.toLowerCase().includes(q);
      const matchReg = flight.aircraft.registration.toLowerCase().includes(q);
      const matchModel = flight.aircraft.model.toLowerCase().includes(q);

      if (
        !matchCallsign &&
        !matchFlightNum &&
        !matchAirline &&
        !matchOrigin &&
        !matchDest &&
        !matchReg &&
        !matchModel
      ) {
        return false;
      }
    }

    // 2. Airline filter
    if (options.selectedAirlines.length > 0) {
      if (!options.selectedAirlines.includes(flight.airline.code)) {
        return false;
      }
    }

    // 3. Altitude range filter
    if (options.altitudeRange !== 'all') {
      if (options.altitudeRange === 'ground' && flight.altitudeFt > 500) return false;
      if (
        options.altitudeRange === 'low' &&
        (flight.altitudeFt <= 500 || flight.altitudeFt > 10000)
      )
        return false;
      if (
        options.altitudeRange === 'mid' &&
        (flight.altitudeFt <= 10000 || flight.altitudeFt > 25000)
      )
        return false;
      if (options.altitudeRange === 'high' && flight.altitudeFt <= 25000) return false;
    }

    // 4. Status filter
    if (options.statusFilter !== 'all') {
      const statusLower = flight.status.toLowerCase();
      if (options.statusFilter === 'cruising' && statusLower !== 'cruising') return false;
      if (
        options.statusFilter === 'climbing' &&
        statusLower !== 'climbing' &&
        statusLower !== 'departing'
      )
        return false;
      if (
        options.statusFilter === 'descending' &&
        statusLower !== 'descending' &&
        statusLower !== 'approach'
      )
        return false;
    }

    // 5. Aircraft type filter
    if (options.aircraftType !== 'all') {
      const isWidebody = ['B77W', 'A333', 'A359', 'B789', 'A388'].includes(
        flight.aircraft.code
      );
      const isTurboprop = ['AT72', 'AT76', 'DH8D', 'C208'].includes(
        flight.aircraft.code
      );
      if (options.aircraftType === 'widebody' && !isWidebody) return false;
      if (options.aircraftType === 'turboprop' && !isTurboprop) return false;
      if (options.aircraftType === 'jets' && (isTurboprop || isWidebody)) return false;
    }

    return true;
  });
}

/**
 * Generate simulated METAR string for an airport
 */
export function generateMetar(airport: Airport): string {
  const now = new Date();
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const min = '00';
  const windDir = Math.floor(Math.random() * 36) * 10;
  const windSpd = 5 + Math.floor(Math.random() * 10);
  const temp = 28 + Math.floor(Math.random() * 5);
  const dew = temp - 4;
  const qnh = 1010 + Math.floor(Math.random() * 5);

  return `${airport.icao} ${day}${hour}${min}Z ${String(windDir).padStart(3, '0')}${String(windSpd).padStart(2, '0')}KT 9999 FEW018TCU BKN020 ${temp}/${dew} Q${qnh} NOSIG`;
}
