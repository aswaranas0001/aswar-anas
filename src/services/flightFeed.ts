import { Flight, Airport } from '../types/flight';
import { createInitialIndonesianFlights } from '../data/mockFlights';
import { INDONESIAN_AIRPORTS, AIRLINES } from '../data/airports';
import { calculateBearing, haversineDistanceKm } from '../utils/aviation';

export type FeedMode = 'hybrid' | 'opensky-live' | 'simulation';

export class FlightFeedService {
  private flights: Map<string, Flight> = new Map();
  private mode: FeedMode = 'hybrid';
  private speedMultiplier: number = 1;
  private openSkyApiKey?: string;
  private lastOpenSkyFetch: number = 0;
  private listeners: Set<(flights: Flight[]) => void> = new Set();
  private timer: any = null;

  constructor() {
    // Seed initial realistic flights
    const initial = createInitialIndonesianFlights();
    initial.forEach((f) => this.flights.set(f.id, f));
  }

  public subscribe(listener: (flights: Flight[]) => void): () => void {
    this.listeners.add(listener);
    listener(Array.from(this.flights.values()));
    return () => this.listeners.delete(listener);
  }

  public setMode(mode: FeedMode) {
    this.mode = mode;
  }

  public getMode(): FeedMode {
    return this.mode;
  }

  public setSpeedMultiplier(multiplier: number) {
    this.speedMultiplier = multiplier;
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  public setOpenSkyCredentials(authHeader?: string) {
    this.openSkyApiKey = authHeader;
  }

  public start() {
    if (this.timer) return;
    this.tick();
    this.timer = setInterval(() => this.tick(), 2000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async fetchOpenSkyLive(): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (this.openSkyApiKey) {
        headers['Authorization'] = this.openSkyApiKey;
      }

      const res = await fetch('/api/flights/live', { headers });
      if (!res.ok) return false;
      const data = await res.json();

      if (data && Array.isArray(data.states) && data.states.length > 0) {
        this.processOpenSkyStates(data.states);
        this.lastOpenSkyFetch = Date.now();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private processOpenSkyStates(states: any[][]) {
    // OpenSky array format:
    // 0: icao24, 1: callsign, 2: origin_country, 3: time_position, 4: last_contact,
    // 5: lon, 6: lat, 7: baro_altitude (meters), 8: on_ground, 9: velocity (m/s),
    // 10: true_track (deg), 11: vertical_rate (m/s), 14: squawk
    for (const s of states) {
      const icao24 = s[0];
      const rawCallsign = (s[1] || '').trim().toUpperCase();
      const lon = s[5];
      const lat = s[6];

      if (lon === null || lat === null) continue;

      // Filter to approximate Indonesian region
      if (lat < -12 || lat > 7 || lon < 93 || lon > 142) continue;

      const altMeters = s[7] || 0;
      const altFt = Math.round(altMeters * 3.28084);
      const speedKnots = Math.round((s[9] || 250) * 1.94384);
      const heading = Math.round(s[10] || 0);
      const verticalRateFpm = Math.round((s[11] || 0) * 196.85);
      const squawk = s[14] || '7000';
      const onGround = Boolean(s[8]);

      // Detect airline from callsign prefix
      const prefix3 = rawCallsign.substring(0, 3);
      let matchedAirline = Object.values(AIRLINES).find(
        (a) => a.callsignPrefix === prefix3 || a.code === rawCallsign.substring(0, 2)
      );

      if (!matchedAirline) {
        matchedAirline = {
          name: s[2] ? `Pesawat ${s[2]}` : 'General Aviation',
          code: rawCallsign.substring(0, 2) || 'XX',
          icao: prefix3 || 'UNK',
          callsignPrefix: prefix3 || 'UNK',
          color: '#38bdf8',
          country: s[2] || 'Indonesia',
        };
      }

      // Check if we already have this flight
      const existing = this.flights.get(icao24);
      if (existing) {
        existing.lat = lat;
        existing.lon = lon;
        existing.altitudeFt = altFt;
        existing.altitudeMeters = altMeters;
        existing.groundSpeedKnots = speedKnots;
        existing.groundSpeedKmh = Math.round(speedKnots * 1.852);
        existing.heading = heading;
        existing.verticalSpeedFpm = verticalRateFpm;
        existing.squawk = squawk;
        existing.status = onGround
          ? 'On Ground'
          : verticalRateFpm > 200
          ? 'Climbing'
          : verticalRateFpm < -200
          ? 'Descending'
          : 'Cruising';
        existing.lastContact = Date.now();
        existing.isLiveOpenSky = true;

        // Append to trail (keep last 25 points)
        existing.trail.push([lat, lon, altFt]);
        if (existing.trail.length > 25) existing.trail.shift();
      } else {
        // Create new live aircraft entry
        const nearestOrigin = this.findNearestAirport(lat, lon);
        const secondNearest = INDONESIAN_AIRPORTS.find((a) => a.iata !== nearestOrigin.iata) || INDONESIAN_AIRPORTS[0];

        const newFlight: Flight = {
          id: icao24,
          icao24,
          callsign: rawCallsign || `ID-${icao24.toUpperCase().substring(0, 4)}`,
          flightNumber: `${matchedAirline.code} ${rawCallsign.replace(/^\D+/g, '') || '801'}`,
          airline: matchedAirline,
          aircraft: {
            model: 'Airbus A320-200',
            code: 'A320',
            registration: `PK-${icao24.substring(0, 3).toUpperCase()}`,
            manufacturer: 'Airbus',
            wakeCategory: 'M',
            ageYears: 5,
          },
          origin: nearestOrigin,
          destination: secondNearest,
          lat,
          lon,
          altitudeFt: altFt,
          altitudeMeters: altMeters,
          heading,
          groundSpeedKnots: speedKnots,
          groundSpeedKmh: Math.round(speedKnots * 1.852),
          verticalSpeedFpm: verticalRateFpm,
          squawk,
          status: onGround
            ? 'On Ground'
            : verticalRateFpm > 200
            ? 'Climbing'
            : verticalRateFpm < -200
            ? 'Descending'
            : 'Cruising',
          progress: 50,
          departureTime: '13:00 WIB',
          scheduledArrivalTime: '15:30 WIB',
          estimatedArrivalTime: '15:28 WIB',
          distanceTraveledKm: 300,
          distanceRemainingKm: 300,
          totalDistanceKm: 600,
          trail: [[lat, lon, altFt]],
          lastContact: Date.now(),
          isLiveOpenSky: true,
          fir: lon > 115 ? 'Ujung Pandang FIR' : 'Jakarta FIR',
          aiAnalysis: {
            turbulenceRisk: 'Low',
            flightEfficiencyScore: 94,
            routeWeatherSummary: 'Posisi ADS-B aktual dari penerima sinyal radar.',
            etaConfidence: '98% (Live Telemetry)',
            fuelBurnRateKgH: 2400,
          },
        };
        this.flights.set(icao24, newFlight);
      }
    }
  }

  private findNearestAirport(lat: number, lon: number): Airport {
    let best = INDONESIAN_AIRPORTS[0];
    let bestDist = Infinity;
    for (const a of INDONESIAN_AIRPORTS) {
      const d = haversineDistanceKm(lat, lon, a.lat, a.lon);
      if (d < bestDist) {
        bestDist = d;
        best = a;
      }
    }
    return best;
  }

  private tick() {
    // If in hybrid or live mode, fetch OpenSky every 20 seconds
    const now = Date.now();
    if (this.mode !== 'simulation' && now - this.lastOpenSkyFetch > 20000) {
      this.fetchOpenSkyLive();
    }

    // Advance simulated flights along their real paths
    this.advanceSimulatedFlights();

    // Broadcast updated state to all UI listeners
    const flightList = Array.from(this.flights.values());
    this.listeners.forEach((listener) => listener(flightList));
  }

  private advanceSimulatedFlights() {
    const dtSeconds = 2 * this.speedMultiplier;

    for (const [id, flight] of this.flights.entries()) {
      // If it's a pure live OpenSky feed updated recently, don't simulate
      if (flight.isLiveOpenSky && Date.now() - flight.lastContact < 30000) {
        continue;
      }

      // Convert ground speed to distance covered in this tick
      // Speed in knots (nautical miles per hour), 1 knot = 1.852 km/h
      const kmPerHour = flight.groundSpeedKnots * 1.852;
      const kmCovered = (kmPerHour / 3600) * dtSeconds;

      const totalDist = Math.max(50, flight.totalDistanceKm);
      let newDistTraveled = flight.distanceTraveledKm + kmCovered;

      // Check if arrived at destination
      if (newDistTraveled >= totalDist) {
        // Turn around flight (simulate return flight)
        const temp = flight.origin;
        flight.origin = flight.destination;
        flight.destination = temp;
        newDistTraveled = 5; // just departing
        flight.departureTime = 'Baru Lepas Landas';
        flight.status = 'Climbing';
        flight.altitudeFt = 4000;
        flight.verticalSpeedFpm = 2200;
        flight.trail = [[flight.origin.lat, flight.origin.lon, 1000]];
      }

      flight.distanceTraveledKm = Math.round(newDistTraveled);
      flight.distanceRemainingKm = Math.max(0, Math.round(totalDist - newDistTraveled));
      const progressFraction = Math.min(0.99, Math.max(0.01, newDistTraveled / totalDist));
      flight.progress = Math.round(progressFraction * 100);

      // Interpolate position along great circle
      const lat = flight.origin.lat + (flight.destination.lat - flight.origin.lat) * progressFraction;
      const lon = flight.origin.lon + (flight.destination.lon - flight.origin.lon) * progressFraction;

      flight.lat = Number(lat.toFixed(4));
      flight.lon = Number(lon.toFixed(4));
      flight.heading = calculateBearing(flight.lat, flight.lon, flight.destination.lat, flight.destination.lon);

      // Realistic altitude profile based on route progress
      if (progressFraction < 0.15) {
        flight.status = 'Climbing';
        flight.verticalSpeedFpm = 1800;
        flight.altitudeFt = Math.min(35000, Math.round(progressFraction * (35000 / 0.15)));
      } else if (progressFraction > 0.82) {
        flight.status = 'Descending';
        flight.verticalSpeedFpm = -1600;
        const descentProgress = (progressFraction - 0.82) / 0.18;
        flight.altitudeFt = Math.max(1500, Math.round(35000 * (1 - descentProgress)));
      } else {
        flight.status = 'Cruising';
        flight.verticalSpeedFpm = 0;
      }

      flight.altitudeMeters = Math.round(flight.altitudeFt * 0.3048);
      flight.lastContact = Date.now();

      // Record breadcrumb trail point every few ticks
      const lastPoint = flight.trail[flight.trail.length - 1];
      if (
        !lastPoint ||
        haversineDistanceKm(lastPoint[0], lastPoint[1], flight.lat, flight.lon) > 8
      ) {
        flight.trail.push([flight.lat, flight.lon, flight.altitudeFt]);
        if (flight.trail.length > 30) flight.trail.shift();
      }
    }
  }
}

export const flightFeed = new FlightFeedService();
