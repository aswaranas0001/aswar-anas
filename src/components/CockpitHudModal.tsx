import React from 'react';
import { X, Plane, Compass, Navigation, Radio } from 'lucide-react';
import { Flight } from '../types/flight';
import { formatAltitude, formatSpeed } from '../utils/aviation';

interface CockpitHudModalProps {
  flight: Flight;
  onClose: () => void;
}

export const CockpitHudModal: React.FC<CockpitHudModalProps> = ({ flight, onClose }) => {
  // Pitch angle approximation based on vertical speed
  const pitchDeg = Math.max(-15, Math.min(15, flight.verticalSpeedFpm / 150));
  // Bank angle subtle roll
  const bankDeg = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono-radar"
      data-testid="cockpit-hud-modal"
    >
      <div className="relative w-full max-w-4xl h-[560px] bg-slate-950 rounded-2xl border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/40 overflow-hidden flex flex-col select-none">
        {/* Cockpit HUD Top Bar */}
        <div className="bg-slate-900/90 border-b border-emerald-500/30 px-5 py-3 flex items-center justify-between text-emerald-400">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wider text-sm">
              SYNTHETIC VISION HUD &bull; {flight.aircraft.model}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
              {flight.flightNumber} ({flight.callsign})
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Tampilan Kokpit"
            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cockpit Glass Display Canvas */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/20 overflow-hidden flex items-center justify-center">
          {/* Subtle Artificial Horizon Background */}
          <div
            className="absolute inset-0 flex flex-col transition-transform duration-700 pointer-events-none"
            style={{
              transform: `translateY(${pitchDeg * 4}px) rotate(${bankDeg}deg)`,
            }}
          >
            <div className="flex-1 bg-gradient-to-b from-sky-950/30 to-sky-900/20" />
            <div className="h-[2px] w-full bg-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <div className="flex-1 bg-gradient-to-b from-emerald-950/20 to-slate-950/40" />
          </div>

          {/* Heading Tape at Top */}
          <div className="absolute top-4 inset-x-20 flex flex-col items-center pointer-events-none z-10">
            <div className="bg-slate-950/80 border border-emerald-500/40 px-4 py-1 rounded text-emerald-300 font-bold text-sm tracking-widest shadow-md">
              HDG {String(flight.heading).padStart(3, '0')}&deg;
            </div>
            <div className="w-0.5 h-3 bg-emerald-400 mt-1" />
            {/* Heading tick markers */}
            <div className="flex items-center space-x-6 text-[11px] text-emerald-500/70 mt-1">
              <span>{((flight.heading - 20 + 360) % 360)}</span>
              <span>{((flight.heading - 10 + 360) % 360)}</span>
              <span className="text-emerald-300 font-bold">{flight.heading}</span>
              <span>{((flight.heading + 10) % 360)}</span>
              <span>{((flight.heading + 20) % 360)}</span>
            </div>
          </div>

          {/* Airspeed Tape on Left */}
          <div className="absolute left-6 inset-y-16 w-20 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="text-[10px] text-emerald-400 tracking-wider font-semibold mb-1">
              IAS KTS
            </div>
            <div className="w-full bg-slate-950/90 border border-emerald-500/40 rounded-lg p-2 flex flex-col items-center">
              <div className="text-xs text-emerald-500/60">{flight.groundSpeedKnots + 20}</div>
              <div className="text-xs text-emerald-500/80">{flight.groundSpeedKnots + 10}</div>
              <div className="my-1 py-1 px-2 w-full text-center bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-bold text-base rounded shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                {flight.groundSpeedKnots}
              </div>
              <div className="text-xs text-emerald-500/80">{flight.groundSpeedKnots - 10}</div>
              <div className="text-xs text-emerald-500/60">{flight.groundSpeedKnots - 20}</div>
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">
              {formatSpeed(flight.groundSpeedKnots, 'kmh')}
            </div>
          </div>

          {/* Altimeter Tape on Right */}
          <div className="absolute right-6 inset-y-16 w-24 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="text-[10px] text-emerald-400 tracking-wider font-semibold mb-1">
              ALT FEET
            </div>
            <div className="w-full bg-slate-950/90 border border-emerald-500/40 rounded-lg p-2 flex flex-col items-center">
              <div className="text-xs text-emerald-500/60">
                {(flight.altitudeFt + 500).toLocaleString()}
              </div>
              <div className="my-1 py-1 px-1.5 w-full text-center bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-bold text-sm rounded shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                {flight.altitudeFt.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-500/60">
                {Math.max(0, flight.altitudeFt - 500).toLocaleString()}
              </div>
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">
              QNH 1013 HPA
            </div>
          </div>

          {/* Central Pitch Ladder & Aircraft Boresight */}
          <div className="relative flex flex-col items-center justify-center pointer-events-none z-10">
            {/* Pitch +10 deg bar */}
            <div className="w-28 h-0.5 border-t border-emerald-400/40 flex justify-between px-1 mb-8">
              <span className="text-[9px] text-emerald-400/80 -mt-2">+10</span>
              <span className="text-[9px] text-emerald-400/80 -mt-2">+10</span>
            </div>

            {/* Central Aircraft Waterline Symbol */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <div className="w-8 h-1 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>

            {/* Pitch -10 deg bar */}
            <div className="w-28 h-0.5 border-t border-dashed border-emerald-400/40 flex justify-between px-1 mt-8">
              <span className="text-[9px] text-emerald-400/80 -mt-2">-10</span>
              <span className="text-[9px] text-emerald-400/80 -mt-2">-10</span>
            </div>
          </div>

          {/* Bottom Telemetry Overlay */}
          <div className="absolute bottom-4 inset-x-8 flex items-center justify-between text-xs text-emerald-400 z-10 pointer-events-none">
            <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-emerald-500/30">
              <span className="text-emerald-500/80">RUTE: </span>
              <span className="font-bold text-white">
                {flight.origin.iata} &rarr; {flight.destination.iata}
              </span>
            </div>

            <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-emerald-500/30">
              <span className="text-emerald-500/80">VERTICAL SPEED: </span>
              <span className="font-bold text-white">
                {flight.verticalSpeedFpm > 0 ? `+${flight.verticalSpeedFpm}` : flight.verticalSpeedFpm} FPM
              </span>
            </div>

            <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-emerald-500/30">
              <span className="text-emerald-500/80">STATUS: </span>
              <span className="font-bold text-white uppercase">{flight.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
