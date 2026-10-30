import React from 'react';
import {
  X,
  Plane,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Compass,
  ListFilter,
} from 'lucide-react';
import { Flight } from '../types/flight';
import { formatAltitude, formatSpeed, getAltitudeColor } from '../utils/aviation';

interface FlightListDrawerProps {
  flights: Flight[];
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
  onClose: () => void;
}

export const FlightListDrawer: React.FC<FlightListDrawerProps> = ({
  flights,
  selectedFlight,
  onSelectFlight,
  onClose,
}) => {
  return (
    <div
      className="w-full sm:w-[380px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl flex flex-col h-full max-h-[85vh] sm:max-h-full sm:h-auto rounded-t-2xl sm:rounded-2xl overflow-hidden font-sans text-slate-100"
      data-testid="flight-list-drawer"
    >
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListFilter className="w-4 h-4 text-sky-400" />
          <h3 className="font-display-radar font-bold text-sm tracking-wide text-white">
            DAFTAR PENERBANGAN AKTIF
          </h3>
          <span className="text-[11px] font-mono-radar px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold">
            {flights.length}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Tutup daftar penerbangan"
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Flight Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {flights.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Tidak ada penerbangan yang cocok dengan filter saat ini.
          </div>
        ) : (
          flights.map((flight) => {
            const isSelected = selectedFlight?.id === flight.id;
            const altColor = getAltitudeColor(flight.altitudeFt);

            return (
              <div
                key={flight.id}
                onClick={() => onSelectFlight(flight)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500 shadow-md shadow-sky-950/50'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center font-display-radar font-bold text-[11px] text-white shadow"
                      style={{ backgroundColor: flight.airline.color }}
                    >
                      {flight.airline.code}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-display-radar font-bold text-sm text-white">
                          {flight.flightNumber}
                        </span>
                        <span className="text-[10px] font-mono-radar text-slate-400">
                          {flight.callsign}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate max-w-[170px]">
                        {flight.airline.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: altColor }}
                      />
                      <span className="text-xs font-mono-radar font-bold text-white">
                        {formatAltitude(flight.altitudeFt, 'ft')}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono-radar text-slate-400 mt-0.5">
                      {formatSpeed(flight.groundSpeedKnots, 'kts')} &bull; {flight.heading}&deg;
                    </div>
                  </div>
                </div>

                {/* Route Bar */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-400">
                    {flight.origin.iata} ({flight.origin.city})
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <div className="h-0.5 w-6 bg-slate-700" />
                    <Plane className="w-3 h-3 text-slate-400 transform rotate-90" />
                  </div>
                  <span className="font-semibold text-emerald-400">
                    {flight.destination.iata} ({flight.destination.city})
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
