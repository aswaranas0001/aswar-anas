import React, { useState } from 'react';
import {
  X,
  Building2,
  Wind,
  PlaneTakeoff,
  PlaneLanding,
  Crosshair,
  Compass,
  ArrowUpRight,
  Share2,
} from 'lucide-react';
import { Airport, Flight } from '../types/flight';
import { generateMetar } from '../utils/aviation';

interface AirportDetailModalProps {
  airport: Airport;
  allFlights: Flight[];
  onClose: () => void;
  onSelectFlight: (flight: Flight) => void;
  onFocusMap: (lat: number, lon: number) => void;
  onOpenShare?: () => void;
}

export const AirportDetailModal: React.FC<AirportDetailModalProps> = ({
  airport,
  allFlights,
  onClose,
  onSelectFlight,
  onFocusMap,
  onOpenShare,
}) => {
  const [tab, setTab] = useState<'departures' | 'arrivals'>('departures');
  const metar = generateMetar(airport);

  // Filter flights connected to this airport
  const departures = allFlights.filter((f) => f.origin.iata === airport.iata);
  const arrivals = allFlights.filter((f) => f.destination.iata === airport.iata);

  const displayedFlights = tab === 'departures' ? departures : arrivals;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-sans text-slate-100"
      data-testid="airport-detail-modal"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display-radar font-bold text-2xl text-white tracking-wider">
                  {airport.iata}
                </span>
                <span className="text-xs font-mono-radar px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                  {airport.icao}
                </span>
                {airport.fir && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {airport.fir === 'WIIF' ? 'FIR Jakarta' : 'FIR Ujung Pandang'}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mt-0.5">{airport.name}</h3>
              <p className="text-xs text-slate-400">
                {airport.city}{airport.province ? `, ${airport.province}` : ''} &bull; Elevasi {airport.elevationFt} ft
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                aria-label="Bagikan link bandara ini"
                title="Bagikan Link Bandara AIR RADAR AI"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Tutup Detail Bandara"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Airport Info & METAR */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-3">
          {/* Weather / METAR */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-sky-400 font-medium">
              <Wind className="w-4 h-4" />
              <span>METAR Cuaca Aktual Penerbangan:</span>
            </div>
            <button
              onClick={() => onFocusMap(airport.lat, airport.lon)}
              className="flex items-center space-x-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 px-2.5 py-1 rounded-lg border border-sky-800/60 transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Fokus Peta</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono-radar text-xs text-emerald-400 tracking-wide select-text">
            {metar}
          </div>

          {/* Runways */}
          {airport.runways && airport.runways.length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Landasan Pacu (Runway):</span>
              <div className="flex flex-wrap gap-1.5">
                {airport.runways.map((rw, i) => (
                  <span
                    key={i}
                    className="font-mono-radar px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
                  >
                    {rw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Flight Schedule Board Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40">
          <button
            onClick={() => setTab('departures')}
            className={`flex-1 py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              tab === 'departures'
                ? 'border-sky-500 text-sky-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlaneTakeoff className="w-4 h-4" />
            <span>Keberangkatan ({departures.length})</span>
          </button>
          <button
            onClick={() => setTab('arrivals')}
            className={`flex-1 py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              tab === 'arrivals'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlaneLanding className="w-4 h-4" />
            <span>Kedatangan ({arrivals.length})</span>
          </button>
        </div>

        {/* Flight Board List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayedFlights.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Tidak ada penerbangan aktif terjadwal saat ini untuk bandara ini.
            </div>
          ) : (
            displayedFlights.map((flight) => (
              <div
                key={flight.id}
                onClick={() => {
                  onSelectFlight(flight);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow"
                    style={{ backgroundColor: flight.airline.color }}
                  >
                    {flight.airline.code}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-display-radar font-bold text-white group-hover:text-sky-400 transition-colors">
                        {flight.flightNumber}
                      </span>
                      <span className="text-[11px] font-mono-radar text-slate-400">
                        ({flight.aircraft.code})
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      {tab === 'departures'
                        ? `Ke: ${flight.destination.city} (${flight.destination.iata})`
                        : `Dari: ${flight.origin.city} (${flight.origin.iata})`}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono-radar font-bold text-amber-300">
                    {tab === 'departures' ? flight.departureTime : `ETA ${flight.scheduledArrivalTime}`}
                  </div>
                  <div className="text-[11px] font-mono-radar text-sky-400 flex items-center justify-end space-x-1 mt-0.5">
                    <span>{flight.status}</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
