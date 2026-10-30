import React, { useState } from 'react';
import {
  X,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Navigation,
  Sparkles,
  Plane,
  Eye,
  Crosshair,
  Clock,
  MapPin,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Flight } from '../types/flight';
import {
  formatAltitude,
  formatSpeed,
  formatVerticalSpeed,
  getAltitudeColor,
} from '../utils/aviation';

interface FlightDetailPanelProps {
  flight: Flight;
  onClose: () => void;
  onOpenCockpit: () => void;
  onFollowToggle: () => void;
  isFollowing: boolean;
  onFocusAirport: (iata: string) => void;
  onOpenShare?: () => void;
}

export const FlightDetailPanel: React.FC<FlightDetailPanelProps> = ({
  flight,
  onClose,
  onOpenCockpit,
  onFollowToggle,
  isFollowing,
  onFocusAirport,
  onOpenShare,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState(flight.aiAnalysis);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const altColor = getAltitudeColor(flight.altitudeFt);
  const vs = formatVerticalSpeed(flight.verticalSpeedFpm);

  const requestAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flight }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAiAnalysis(data.analysis);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div
      className="w-full sm:w-[410px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 shadow-2xl flex flex-col h-full max-h-[92vh] sm:max-h-full sm:h-auto rounded-t-2xl sm:rounded-2xl overflow-hidden transition-all duration-300 font-sans text-slate-100"
      data-testid="flight-detail-panel"
    >
      {/* Top Banner with Airline Identity */}
      <div
        className="px-4 py-3.5 flex items-center justify-between border-b border-white/10"
        style={{
          background: `linear-gradient(135deg, ${flight.airline.color}33, rgba(15, 23, 42, 0.95))`,
        }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-display-radar font-bold text-sm shadow-md border border-white/20 text-white"
            style={{ backgroundColor: flight.airline.color }}
          >
            {flight.airline.code}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display-radar font-bold text-lg text-white tracking-wide">
                {flight.flightNumber}
              </h2>
              <span className="text-[11px] font-mono-radar px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                {flight.callsign}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{flight.airline.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              aria-label="Bagikan link penerbangan ini"
              title="Bagikan Link Pesawat AIR RADAR AI"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Tutup detail penerbangan"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
        {/* Route Card: Origin -> Destination */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => onFocusAirport(flight.origin.iata)}
              className="text-left group"
              title="Fokus ke Bandara Asal"
            >
              <div className="font-display-radar text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">
                {flight.origin.iata}
              </div>
              <div className="text-xs text-slate-300 font-medium">{flight.origin.city}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{flight.departureTime}</div>
            </button>

            <div className="flex-1 px-3 flex flex-col items-center">
              <div className="text-[10px] text-sky-400 font-mono-radar font-semibold uppercase tracking-wider mb-1">
                {flight.status}
              </div>
              <div className="w-full relative flex items-center">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${flight.progress}%` }}
                  />
                </div>
                <div
                  className="absolute transform -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${flight.progress}%`, top: '50%' }}
                >
                  <Plane className="w-3.5 h-3.5 text-white transform rotate-90 drop-shadow" />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono-radar mt-1">
                {flight.progress}% Selesai
              </div>
            </div>

            <button
              onClick={() => onFocusAirport(flight.destination.iata)}
              className="text-right group"
              title="Fokus ke Bandara Tujuan"
            >
              <div className="font-display-radar text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">
                {flight.destination.iata}
              </div>
              <div className="text-xs text-slate-300 font-medium">{flight.destination.city}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ETA {flight.scheduledArrivalTime}
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>Jarak: {flight.distanceTraveledKm} / {flight.totalDistanceKm} km</span>
            </span>
            <span className="font-mono-radar text-slate-300">
              Sisa {flight.distanceRemainingKm} km
            </span>
          </div>
        </div>

        {/* Live Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Altitude */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ketinggian</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: altColor }}
              />
            </div>
            <div className="text-base font-bold font-mono-radar text-white mt-1">
              {formatAltitude(flight.altitudeFt, 'ft')}
            </div>
            <div className="text-[10px] text-slate-400 font-mono-radar">
              {formatAltitude(flight.altitudeFt, 'm')} &bull; FL{Math.round(flight.altitudeFt / 100)}
            </div>
          </div>

          {/* Speed */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Kecepatan Tanah</span>
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-base font-bold font-mono-radar text-white mt-1">
              {formatSpeed(flight.groundSpeedKnots, 'kts')}
            </div>
            <div className="text-[10px] text-slate-400 font-mono-radar">
              {formatSpeed(flight.groundSpeedKnots, 'kmh')}
            </div>
          </div>

          {/* Heading & Track */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Heading / Arah</span>
              <Compass className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-base font-bold font-mono-radar text-white mt-1 flex items-center space-x-1.5">
              <span>{flight.heading}&deg;</span>
              <Navigation
                className="w-3.5 h-3.5 text-sky-400 inline transform"
                style={{ transform: `rotate(${flight.heading}deg)` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono-radar">
              Lat: {flight.lat.toFixed(2)}, Lon: {flight.lon.toFixed(2)}
            </div>
          </div>

          {/* Vertical Speed */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Kecepatan Vertikal</span>
              {vs.indicator === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              ) : vs.indicator === 'down' ? (
                <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <span className="text-[10px] text-slate-500">LEVEL</span>
              )}
            </div>
            <div
              className={`text-base font-bold font-mono-radar mt-1 ${
                vs.indicator === 'up'
                  ? 'text-emerald-400'
                  : vs.indicator === 'down'
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {vs.text}
            </div>
            <div className="text-[10px] text-slate-400 font-mono-radar">
              Squawk: <span className="text-sky-300 font-bold">{flight.squawk}</span>
            </div>
          </div>
        </div>

        {/* Aircraft Technical Details */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Informasi Pesawat & Navigasi
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Tipe Pesawat:</span>
              <span className="font-semibold text-white">{flight.aircraft.model}</span>
              <span className="text-sky-400 text-[10px] font-mono-radar ml-1">
                ({flight.aircraft.code})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Registrasi:</span>
              <span className="font-mono-radar font-bold text-amber-300">
                {flight.aircraft.registration}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Mode-S ICAO24:</span>
              <span className="font-mono-radar text-slate-300">{flight.icao24}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Wilayah Udara / FIR:</span>
              <span className="font-semibold text-sky-300">{flight.fir}</span>
            </div>
          </div>
        </div>

        {/* AI Flight Intelligence Box */}
        {aiAnalysis && (
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-sky-950/40 p-3.5 rounded-xl border border-sky-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-sky-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Flight Analytics
                </span>
              </div>
              <button
                onClick={requestAiAnalysis}
                disabled={isAiLoading}
                className="text-[10px] text-sky-300 hover:text-white bg-sky-900/40 hover:bg-sky-800/60 px-2 py-0.5 rounded border border-sky-600/30 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? 'Menganalisis...' : 'Perbarui AI'}
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {aiAnalysis.routeWeatherSummary}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
              <div>
                <span className="text-slate-400 block">Turbulensi</span>
                <span
                  className={`font-semibold ${
                    aiAnalysis.turbulenceRisk === 'Low'
                      ? 'text-emerald-400'
                      : aiAnalysis.turbulenceRisk === 'Moderate'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {aiAnalysis.turbulenceRisk}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Efisiensi Rute</span>
                <span className="font-semibold text-sky-400">
                  {aiAnalysis.flightEfficiencyScore}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Konsumsi Avtur</span>
                <span className="font-semibold text-amber-300 font-mono-radar">
                  {aiAnalysis.fuelBurnRateKgH} kg/jam
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Cockpit HUD & Follow */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenCockpit}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-sky-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Eye className="w-4 h-4" />
            <span>Kokpit 3D HUD</span>
          </button>

          <button
            onClick={onFollowToggle}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
              isFollowing
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>{isFollowing ? 'Sedang Diikuti' : 'Ikuti Pesawat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
