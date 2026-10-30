export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  province?: string;
  country: string;
  lat: number;
  lon: number;
  elevationFt: number;
  runways?: string[];
  fir?: 'WAAF' | 'WIIF'; // Ujung Pandang or Jakarta FIR
}

export interface Airline {
  name: string;
  code: string;
  icao: string;
  callsignPrefix: string;
  color: string;
  textColor?: string;
  country: string;
}

export interface AircraftInfo {
  model: string;
  code: string; // e.g. B738, A320, AT76, B77W
  registration: string; // e.g. PK-GMF
  manufacturer: string;
  wakeCategory: 'L' | 'M' | 'H'; // Light, Medium, Heavy
  ageYears?: number;
}

export interface PositionPoint {
  lat: number;
  lon: number;
  altitudeFt: number;
  timestamp: number;
}

export type FlightStatus = 
  | 'Cruising' 
  | 'Climbing' 
  | 'Descending' 
  | 'Approach' 
  | 'Departing' 
  | 'On Ground';

export interface Flight {
  id: string; // unique
  icao24: string; // Hex code, e.g. 8a0123
  callsign: string; // e.g. GIA404
  flightNumber: string; // e.g. GA 404
  airline: Airline;
  aircraft: AircraftInfo;
  origin: Airport;
  destination: Airport;
  lat: number;
  lon: number;
  altitudeFt: number;
  altitudeMeters: number;
  heading: number; // 0-359 deg
  groundSpeedKnots: number;
  groundSpeedKmh: number;
  verticalSpeedFpm: number; // feet per minute
  squawk: string;
  status: FlightStatus;
  progress: number; // 0-100%
  departureTime: string; // e.g. "14:15 WIB"
  scheduledArrivalTime: string; // e.g. "16:45 WITA"
  estimatedArrivalTime: string;
  distanceTraveledKm: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  trail: [number, number, number][]; // [lat, lon, altitudeFt]
  lastContact: number; // epoch ms
  isLiveOpenSky?: boolean;
  fir: 'Jakarta FIR' | 'Ujung Pandang FIR' | 'Transit';
  aiAnalysis?: {
    turbulenceRisk: 'Low' | 'Moderate' | 'Severe';
    flightEfficiencyScore: number; // 1-100
    routeWeatherSummary: string;
    etaConfidence: string;
    fuelBurnRateKgH: number;
  };
}

export interface FilterOptions {
  query: string;
  selectedAirlines: string[];
  altitudeRange: 'all' | 'ground' | 'low' | 'mid' | 'high';
  statusFilter: 'all' | 'cruising' | 'climbing' | 'descending';
  aircraftType: 'all' | 'jets' | 'turboprop' | 'widebody';
}

export type MapTileProvider = 'dark-radar' | 'satellite' | 'street' | 'aviation-light';
