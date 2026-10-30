import test from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistanceKm,
  calculateBearing,
  getAltitudeColor,
  formatAltitude,
  formatSpeed,
  formatVerticalSpeed,
  filterFlights,
} from './aviation';
import { Flight, FilterOptions } from '../types/flight';
import { AIRLINES } from '../data/airports';

test('haversineDistanceKm calculates distance between CGK (Jakarta) and DPS (Bali) accurately', () => {
  // CGK: -6.1256, 106.6558
  // DPS: -8.7482, 115.1672
  const distance = haversineDistanceKm(-6.1256, 106.6558, -8.7482, 115.1672);
  // Real distance is approx ~980 km
  assert.ok(distance > 900 && distance < 1050, `Expected distance ~980km, got ${distance}`);
});

test('calculateBearing calculates heading correctly', () => {
  // Directly North: (0, 0) to (10, 0) should be 0 deg
  const headingNorth = calculateBearing(0, 0, 10, 0);
  assert.equal(headingNorth, 0);

  // Directly East: (0, 0) to (0, 10) should be 90 deg
  const headingEast = calculateBearing(0, 0, 0, 10);
  assert.equal(headingEast, 90);

  // Directly South: (10, 0) to (0, 0) should be 180 deg
  const headingSouth = calculateBearing(10, 0, 0, 0);
  assert.equal(headingSouth, 180);
});

test('getAltitudeColor returns appropriate radar gradient colors', () => {
  // Low altitude / ground should return greenish
  assert.equal(getAltitudeColor(500), '#10b981');
  // High cruise (FL330) should return cyan/blue
  assert.equal(getAltitudeColor(33000), '#06b6d4');
  // FL380 should return blue
  assert.equal(getAltitudeColor(38000), '#3b82f6');
  // High FL410+
  assert.equal(getAltitudeColor(41000), '#a855f7');
});

test('formatAltitude and formatSpeed format values with units', () => {
  assert.equal(formatAltitude(35000, 'ft'), '35.000 ft');
  assert.equal(formatAltitude(10000, 'm'), '3.048 m');
  assert.equal(formatSpeed(450, 'kts'), '450 kts');
  assert.equal(formatSpeed(450, 'kmh'), '833 km/h');
});

test('formatVerticalSpeed returns correct indicator', () => {
  const climb = formatVerticalSpeed(1800);
  assert.equal(climb.indicator, 'up');
  assert.ok(climb.text.includes('+1.800'));

  const descent = formatVerticalSpeed(-1500);
  assert.equal(descent.indicator, 'down');

  const level = formatVerticalSpeed(10);
  assert.equal(level.indicator, 'level');
});

test('filterFlights filters flights correctly by query and airline', () => {
  const dummyFlights: Flight[] = [
    {
      id: 'f1',
      icao24: '8a0001',
      callsign: 'GIA404',
      flightNumber: 'GA 404',
      airline: AIRLINES.GA,
      aircraft: {
        model: 'Boeing 737-8U3',
        code: 'B738',
        registration: 'PK-GMF',
        manufacturer: 'Boeing',
        wakeCategory: 'M',
      },
      origin: {
        iata: 'CGK',
        icao: 'WIII',
        name: 'Soekarno-Hatta',
        city: 'Jakarta',
        country: 'Indonesia',
        lat: -6.1256,
        lon: 106.6558,
        elevationFt: 34,
      },
      destination: {
        iata: 'DPS',
        icao: 'WADD',
        name: 'Ngurah Rai',
        city: 'Denpasar',
        country: 'Indonesia',
        lat: -8.7482,
        lon: 115.1672,
        elevationFt: 14,
      },
      lat: -7.2,
      lon: 110.5,
      altitudeFt: 35000,
      altitudeMeters: 10668,
      heading: 108,
      groundSpeedKnots: 450,
      groundSpeedKmh: 833,
      verticalSpeedFpm: 0,
      squawk: '7201',
      status: 'Cruising',
      progress: 45,
      departureTime: '10:00 WIB',
      scheduledArrivalTime: '12:30 WITA',
      estimatedArrivalTime: '12:28 WITA',
      distanceTraveledKm: 440,
      distanceRemainingKm: 540,
      totalDistanceKm: 980,
      trail: [],
      lastContact: Date.now(),
      fir: 'Jakarta FIR',
    },
    {
      id: 'f2',
      icao24: '8a0002',
      callsign: 'LNI692',
      flightNumber: 'JT 692',
      airline: AIRLINES.JT,
      aircraft: {
        model: 'Boeing 737-9GP',
        code: 'B739',
        registration: 'PK-LQK',
        manufacturer: 'Boeing',
        wakeCategory: 'M',
      },
      origin: {
        iata: 'SUB',
        icao: 'WARR',
        name: 'Juanda',
        city: 'Surabaya',
        country: 'Indonesia',
        lat: -7.3798,
        lon: 112.7874,
        elevationFt: 9,
      },
      destination: {
        iata: 'UPG',
        icao: 'WAAA',
        name: 'Sultan Hasanuddin',
        city: 'Makassar',
        country: 'Indonesia',
        lat: -5.0617,
        lon: 119.554,
        elevationFt: 47,
      },
      lat: -6.2,
      lon: 116.1,
      altitudeFt: 8000,
      altitudeMeters: 2438,
      heading: 68,
      groundSpeedKnots: 310,
      groundSpeedKmh: 574,
      verticalSpeedFpm: 1500,
      squawk: '6402',
      status: 'Climbing',
      progress: 15,
      departureTime: '11:15 WIB',
      scheduledArrivalTime: '13:40 WITA',
      estimatedArrivalTime: '13:38 WITA',
      distanceTraveledKm: 120,
      distanceRemainingKm: 680,
      totalDistanceKm: 800,
      trail: [],
      lastContact: Date.now(),
      fir: 'Ujung Pandang FIR',
    },
  ];

  const filter1: FilterOptions = {
    query: 'Garuda',
    selectedAirlines: [],
    altitudeRange: 'all',
    statusFilter: 'all',
    aircraftType: 'all',
  };
  const res1 = filterFlights(dummyFlights, filter1);
  assert.equal(res1.length, 1);
  assert.equal(res1[0].callsign, 'GIA404');

  const filter2: FilterOptions = {
    query: '',
    selectedAirlines: ['JT'],
    altitudeRange: 'all',
    statusFilter: 'all',
    aircraftType: 'all',
  };
  const res2 = filterFlights(dummyFlights, filter2);
  assert.equal(res2.length, 1);
  assert.equal(res2[0].callsign, 'LNI692');

  const filterAltitude: FilterOptions = {
    query: '',
    selectedAirlines: [],
    altitudeRange: 'low',
    statusFilter: 'all',
    aircraftType: 'all',
  };
  const resAlt = filterFlights(dummyFlights, filterAltitude);
  assert.equal(resAlt.length, 1);
  assert.equal(resAlt[0].callsign, 'LNI692');
});
