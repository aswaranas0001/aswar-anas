import { Flight } from '../types/flight';
import { AIRLINES, INDONESIAN_AIRPORTS } from './airports';
import { haversineDistanceKm, calculateBearing } from '../utils/aviation';

const getAirport = (iata: string) => {
  const found = INDONESIAN_AIRPORTS.find((a) => a.iata === iata);
  if (!found) throw new Error(`Airport ${iata} not found`);
  return found;
};

// Generates initial realistic trail points behind an aircraft
function generateTrail(
  origLat: number,
  origLon: number,
  currLat: number,
  currLon: number,
  alt: number,
  steps: number = 8
): [number, number, number][] {
  const trail: [number, number, number][] = [];
  for (let i = steps; i >= 0; i--) {
    const factor = 1 - i / steps;
    const lat = origLat + (currLat - origLat) * factor;
    const lon = origLon + (currLon - origLon) * factor;
    const altitude = Math.round(alt * (0.3 + 0.7 * factor));
    trail.push([lat, lon, altitude]);
  }
  return trail;
}

export function createInitialIndonesianFlights(): Flight[] {
  const cgk = getAirport('CGK');
  const dps = getAirport('DPS');
  const sub = getAirport('SUB');
  const upg = getAirport('UPG');
  const kno = getAirport('KNO');
  const yia = getAirport('YIA');
  const bpn = getAirport('BPN');
  const mdc = getAirport('MDC');
  const lbj = getAirport('LBJ');
  const djj = getAirport('DJJ');
  const pdg = getAirport('PDG');
  const sin = getAirport('SIN');
  const kul = getAirport('KUL');
  const syd = getAirport('SYD');
  const per = getAirport('PER');

  const rawFlights: Array<{
    id: string;
    icao24: string;
    callsign: string;
    flightNumber: string;
    airlineKey: keyof typeof AIRLINES;
    origin: typeof cgk;
    destination: typeof dps;
    aircraft: {
      model: string;
      code: string;
      registration: string;
      manufacturer: string;
      wakeCategory: 'L' | 'M' | 'H';
      ageYears: number;
    };
    progress: number;
    altitudeFt: number;
    groundSpeedKnots: number;
    verticalSpeedFpm: number;
    squawk: string;
    status: Flight['status'];
    depTime: string;
    schedArrTime: string;
    fir: Flight['fir'];
    ai: NonNullable<Flight['aiAnalysis']>;
  }> = [
    {
      id: 'gia404',
      icao24: '8a014a',
      callsign: 'GIA404',
      flightNumber: 'GA 404',
      airlineKey: 'GA',
      origin: cgk,
      destination: dps,
      aircraft: {
        model: 'Boeing 737-8U3',
        code: 'B738',
        registration: 'PK-GMC',
        manufacturer: 'Boeing',
        wakeCategory: 'M',
        ageYears: 7,
      },
      progress: 0.58,
      altitudeFt: 35000,
      groundSpeedKnots: 462,
      verticalSpeedFpm: 0,
      squawk: '7102',
      status: 'Cruising',
      depTime: '13:30 WIB',
      schedArrTime: '16:20 WITA',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 94,
        routeWeatherSummary: 'Clear skies over Java Sea, smooth cruising layer at FL350.',
        etaConfidence: '98% (On Time)',
        fuelBurnRateKgH: 2420,
      },
    },
    {
      id: 'lni692',
      icao24: '8a0512',
      callsign: 'LNI692',
      flightNumber: 'JT 692',
      airlineKey: 'JT',
      origin: sub,
      destination: upg,
      aircraft: {
        model: 'Boeing 737-9GP(ER)',
        code: 'B739',
        registration: 'PK-LQK',
        manufacturer: 'Boeing',
        wakeCategory: 'M',
        ageYears: 5,
      },
      progress: 0.38,
      altitudeFt: 33000,
      groundSpeedKnots: 450,
      verticalSpeedFpm: 0,
      squawk: '6415',
      status: 'Cruising',
      depTime: '14:10 WIB',
      schedArrTime: '16:35 WITA',
      fir: 'Ujung Pandang FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 91,
        routeWeatherSummary: 'Light headwinds over Flores Sea, stable conditions.',
        etaConfidence: '95% (On Time)',
        fuelBurnRateKgH: 2510,
      },
    },
    {
      id: 'btk6518',
      icao24: '8a02bd',
      callsign: 'BTK6518',
      flightNumber: 'ID 6518',
      airlineKey: 'ID',
      origin: cgk,
      destination: kno,
      aircraft: {
        model: 'Airbus A320-214',
        code: 'A320',
        registration: 'PK-BKU',
        manufacturer: 'Airbus',
        wakeCategory: 'M',
        ageYears: 4,
      },
      progress: 0.45,
      altitudeFt: 36000,
      groundSpeedKnots: 470,
      verticalSpeedFpm: 0,
      squawk: '5224',
      status: 'Cruising',
      depTime: '13:50 WIB',
      schedArrTime: '16:10 WIB',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Moderate',
        flightEfficiencyScore: 89,
        routeWeatherSummary: 'Isolated convective clouds near Lake Toba, rerouted 5nm east.',
        etaConfidence: '92% (+4 min)',
        fuelBurnRateKgH: 2380,
      },
    },
    {
      id: 'ctv680',
      icao24: '8a08cd',
      callsign: 'CTV680',
      flightNumber: 'QG 680',
      airlineKey: 'QG',
      origin: cgk,
      destination: sub,
      aircraft: {
        model: 'Airbus A320-271N (neo)',
        code: 'A20N',
        registration: 'PK-GTR',
        manufacturer: 'Airbus',
        wakeCategory: 'M',
        ageYears: 3,
      },
      progress: 0.82,
      altitudeFt: 11000,
      groundSpeedKnots: 320,
      verticalSpeedFpm: -1800,
      squawk: '4310',
      status: 'Descending',
      depTime: '14:20 WIB',
      schedArrTime: '15:50 WIB',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 96,
        routeWeatherSummary: 'Optimal descent profile into Juanda Runway 10.',
        etaConfidence: '99% (Early 2 min)',
        fuelBurnRateKgH: 1890,
      },
    },
    {
      id: 'sjv102',
      icao24: '8a09ee',
      callsign: 'SJV102',
      flightNumber: 'IU 102',
      airlineKey: 'IU',
      origin: cgk,
      destination: bpn,
      aircraft: {
        model: 'Airbus A320-232',
        code: 'A320',
        registration: 'PK-SAJ',
        manufacturer: 'Airbus',
        wakeCategory: 'M',
        ageYears: 8,
      },
      progress: 0.52,
      altitudeFt: 34000,
      groundSpeedKnots: 455,
      verticalSpeedFpm: 0,
      squawk: '6205',
      status: 'Cruising',
      depTime: '14:00 WIB',
      schedArrTime: '17:10 WITA',
      fir: 'Ujung Pandang FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 93,
        routeWeatherSummary: 'Clear cruise corridor across Java Sea to East Kalimantan.',
        etaConfidence: '97% (On Time)',
        fuelBurnRateKgH: 2410,
      },
    },
    {
      id: 'won1822',
      icao24: '8a071f',
      callsign: 'WON1822',
      flightNumber: 'IW 1822',
      airlineKey: 'IW',
      origin: dps,
      destination: lbj,
      aircraft: {
        model: 'ATR 72-600',
        code: 'AT76',
        registration: 'PK-WGI',
        manufacturer: 'ATR',
        wakeCategory: 'M',
        ageYears: 6,
      },
      progress: 0.64,
      altitudeFt: 17000,
      groundSpeedKnots: 275,
      verticalSpeedFpm: 0,
      squawk: '3142',
      status: 'Cruising',
      depTime: '14:35 WITA',
      schedArrTime: '15:55 WITA',
      fir: 'Ujung Pandang FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 92,
        routeWeatherSummary: 'Scenic low-altitude island crossing over Sumbawa, excellent visibility.',
        etaConfidence: '96% (On Time)',
        fuelBurnRateKgH: 710,
      },
    },
    {
      id: 'pas210',
      icao24: '8a0614',
      callsign: 'PAS210',
      flightNumber: 'IP 210',
      airlineKey: 'IP',
      origin: cgk,
      destination: yia,
      aircraft: {
        model: 'Airbus A320-214',
        code: 'A320',
        registration: 'PK-PWD',
        manufacturer: 'Airbus',
        wakeCategory: 'M',
        ageYears: 2,
      },
      progress: 0.25,
      altitudeFt: 18000,
      groundSpeedKnots: 390,
      verticalSpeedFpm: 2100,
      squawk: '5116',
      status: 'Climbing',
      depTime: '14:45 WIB',
      schedArrTime: '15:55 WIB',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 95,
        routeWeatherSummary: 'Expedited climb out of Soekarno-Hatta SID, passing Mount Slamet.',
        etaConfidence: '98% (On Time)',
        fuelBurnRateKgH: 2600,
      },
    },
    {
      id: 'gia612',
      icao24: '8a0110',
      callsign: 'GIA612',
      flightNumber: 'GA 612',
      airlineKey: 'GA',
      origin: upg,
      destination: mdc,
      aircraft: {
        model: 'Boeing 737-8U3',
        code: 'B738',
        registration: 'PK-GFE',
        manufacturer: 'Boeing',
        wakeCategory: 'M',
        ageYears: 6,
      },
      progress: 0.70,
      altitudeFt: 29000,
      groundSpeedKnots: 440,
      verticalSpeedFpm: -900,
      squawk: '7340',
      status: 'Descending',
      depTime: '14:15 WITA',
      schedArrTime: '16:00 WITA',
      fir: 'Ujung Pandang FIR',
      ai: {
        turbulenceRisk: 'Moderate',
        flightEfficiencyScore: 90,
        routeWeatherSummary: 'Isolated thunderstorm cells over Gorontalo corridor, descending to STAR.',
        etaConfidence: '94% (On Time)',
        fuelBurnRateKgH: 2200,
      },
    },
    {
      id: 'sjy580',
      icao24: '8a04b1',
      callsign: 'SJY580',
      flightNumber: 'SJ 580',
      airlineKey: 'SJ',
      origin: upg,
      destination: djj,
      aircraft: {
        model: 'Boeing 737-800',
        code: 'B738',
        registration: 'PK-CLC',
        manufacturer: 'Boeing',
        wakeCategory: 'M',
        ageYears: 12,
      },
      progress: 0.35,
      altitudeFt: 37000,
      groundSpeedKnots: 468,
      verticalSpeedFpm: 0,
      squawk: '6712',
      status: 'Cruising',
      depTime: '13:00 WITA',
      schedArrTime: '17:30 WIT',
      fir: 'Ujung Pandang FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 91,
        routeWeatherSummary: 'High cruise over Banda Sea heading towards Papua mountains.',
        etaConfidence: '95% (On Time)',
        fuelBurnRateKgH: 2450,
      },
    },
    {
      id: 'awq840',
      icao24: '8a0901',
      callsign: 'AWQ840',
      flightNumber: 'QZ 840',
      airlineKey: 'QZ',
      origin: dps,
      destination: sin,
      aircraft: {
        model: 'Airbus A320-216',
        code: 'A320',
        registration: 'PK-AZB',
        manufacturer: 'Airbus',
        wakeCategory: 'M',
        ageYears: 5,
      },
      progress: 0.48,
      altitudeFt: 36000,
      groundSpeedKnots: 458,
      verticalSpeedFpm: 0,
      squawk: '5501',
      status: 'Cruising',
      depTime: '14:20 WITA',
      schedArrTime: '17:05 SGT',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 95,
        routeWeatherSummary: 'Northbound airway M774 towards Singapore Changi.',
        etaConfidence: '97% (On Time)',
        fuelBurnRateKgH: 2390,
      },
    },
    {
      id: 'gia718',
      icao24: '8a01f8',
      callsign: 'GIA718',
      flightNumber: 'GA 718',
      airlineKey: 'GA',
      origin: cgk,
      destination: syd,
      aircraft: {
        model: 'Boeing 777-3U3(ER)',
        code: 'B77W',
        registration: 'PK-GIA',
        manufacturer: 'Boeing',
        wakeCategory: 'H',
        ageYears: 9,
      },
      progress: 0.18,
      altitudeFt: 31000,
      groundSpeedKnots: 490,
      verticalSpeedFpm: 900,
      squawk: '7422',
      status: 'Climbing',
      depTime: '14:30 WIB',
      schedArrTime: '00:45 AEDT',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 97,
        routeWeatherSummary: 'Heavy widebody long-haul route, high-speed jet stream entry.',
        etaConfidence: '99% (On Time)',
        fuelBurnRateKgH: 6800,
      },
    },
    {
      id: 'sia231',
      icao24: '76ce12',
      callsign: 'SIA231',
      flightNumber: 'SQ 231',
      airlineKey: 'SQ',
      origin: sin,
      destination: syd,
      aircraft: {
        model: 'Airbus A380-841',
        code: 'A388',
        registration: '9V-SKU',
        manufacturer: 'Airbus',
        wakeCategory: 'H',
        ageYears: 10,
      },
      progress: 0.32,
      altitudeFt: 39000,
      groundSpeedKnots: 512,
      verticalSpeedFpm: 0,
      squawk: '3315',
      status: 'Cruising',
      depTime: '13:45 SGT',
      schedArrTime: '23:50 AEDT',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 96,
        routeWeatherSummary: 'Overflying Java / Bali enroute to Australia.',
        etaConfidence: '99% (On Time)',
        fuelBurnRateKgH: 10200,
      },
    },
    {
      id: 'mas141',
      icao24: '75031b',
      callsign: 'MAS141',
      flightNumber: 'MH 141',
      airlineKey: 'MH',
      origin: kul,
      destination: syd,
      aircraft: {
        model: 'Airbus A330-323',
        code: 'A333',
        registration: '9M-MTH',
        manufacturer: 'Airbus',
        wakeCategory: 'H',
        ageYears: 8,
      },
      progress: 0.28,
      altitudeFt: 38000,
      groundSpeedKnots: 485,
      verticalSpeedFpm: 0,
      squawk: '4221',
      status: 'Cruising',
      depTime: '14:05 MYT',
      schedArrTime: '00:15 AEDT',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 94,
        routeWeatherSummary: 'Transiting Indonesian FIR corridor via airway N884.',
        etaConfidence: '98% (On Time)',
        fuelBurnRateKgH: 5200,
      },
    },
    {
      id: 'uae404',
      icao24: '896404',
      callsign: 'UAE404',
      flightNumber: 'EK 404',
      airlineKey: 'EK',
      origin: sin,
      destination: dps,
      aircraft: {
        model: 'Boeing 777-31H(ER)',
        code: 'B77W',
        registration: 'A6-EGA',
        manufacturer: 'Boeing',
        wakeCategory: 'H',
        ageYears: 7,
      },
      progress: 0.65,
      altitudeFt: 37000,
      groundSpeedKnots: 495,
      verticalSpeedFpm: 0,
      squawk: '7155',
      status: 'Cruising',
      depTime: '14:10 SGT',
      schedArrTime: '16:55 WITA',
      fir: 'Jakarta FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 96,
        routeWeatherSummary: 'Direct routing across Java Sea to Bali Ngurah Rai.',
        etaConfidence: '99% (On Time)',
        fuelBurnRateKgH: 6400,
      },
    },
    {
      id: 'qfa71',
      icao24: '7c4271',
      callsign: 'QFA71',
      flightNumber: 'QF 71',
      airlineKey: 'QF',
      origin: per,
      destination: sin,
      aircraft: {
        model: 'Airbus A330-202',
        code: 'A332',
        registration: 'VH-EBA',
        manufacturer: 'Airbus',
        wakeCategory: 'H',
        ageYears: 11,
      },
      progress: 0.42,
      altitudeFt: 38000,
      groundSpeedKnots: 480,
      verticalSpeedFpm: 0,
      squawk: '2118',
      status: 'Cruising',
      depTime: '13:15 AWST',
      schedArrTime: '18:40 SGT',
      fir: 'Ujung Pandang FIR',
      ai: {
        turbulenceRisk: 'Low',
        flightEfficiencyScore: 93,
        routeWeatherSummary: 'Northbound track over Lombok Strait crossing into Java Sea.',
        etaConfidence: '97% (On Time)',
        fuelBurnRateKgH: 5100,
      },
    },
  ];

  return rawFlights.map((rf) => {
    const totalDist = haversineDistanceKm(
      rf.origin.lat,
      rf.origin.lon,
      rf.destination.lat,
      rf.destination.lon
    );
    const currLat = rf.origin.lat + (rf.destination.lat - rf.origin.lat) * rf.progress;
    const currLon = rf.origin.lon + (rf.destination.lon - rf.origin.lon) * rf.progress;
    const heading = calculateBearing(currLat, currLon, rf.destination.lat, rf.destination.lon);
    const distTraveled = Math.round(totalDist * rf.progress);
    const distRemaining = Math.max(0, totalDist - distTraveled);

    const trail = generateTrail(
      rf.origin.lat,
      rf.origin.lon,
      currLat,
      currLon,
      rf.altitudeFt,
      10
    );

    return {
      id: rf.id,
      icao24: rf.icao24,
      callsign: rf.callsign,
      flightNumber: rf.flightNumber,
      airline: AIRLINES[rf.airlineKey],
      aircraft: rf.aircraft,
      origin: rf.origin,
      destination: rf.destination,
      lat: Number(currLat.toFixed(4)),
      lon: Number(currLon.toFixed(4)),
      altitudeFt: rf.altitudeFt,
      altitudeMeters: Math.round(rf.altitudeFt * 0.3048),
      heading,
      groundSpeedKnots: rf.groundSpeedKnots,
      groundSpeedKmh: Math.round(rf.groundSpeedKnots * 1.852),
      verticalSpeedFpm: rf.verticalSpeedFpm,
      squawk: rf.squawk,
      status: rf.status,
      progress: Math.round(rf.progress * 100),
      departureTime: rf.depTime,
      scheduledArrivalTime: rf.schedArrTime,
      estimatedArrivalTime: rf.schedArrTime,
      distanceTraveledKm: distTraveled,
      distanceRemainingKm: distRemaining,
      totalDistanceKm: totalDist,
      trail,
      lastContact: Date.now(),
      fir: rf.fir,
      aiAnalysis: rf.ai,
    };
  });
}
