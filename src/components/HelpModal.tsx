import React from 'react';
import {
  X,
  Plane,
  Radio,
  Eye,
  Building2,
  Compass,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { getAltitudeColor } from '../utils/aviation';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const altitudeBands = [
    { label: '0 - 1.000 ft (Ground / Taxi / Lepas Landas)', alt: 500 },
    { label: '1.000 - 5.000 ft (Initial Climb / Final Approach)', alt: 3500 },
    { label: '5.000 - 12.000 ft (Low Altitude Corridor)', alt: 9000 },
    { label: '12.000 - 24.000 ft (Mid Climb & Descent)', alt: 18000 },
    { label: '24.000 - 34.000 ft (Cruise En-Route Domestik)', alt: 30000 },
    { label: '34.000 - 39.000 ft (Standard Jet Flight Level)', alt: 36000 },
    { label: '39.000+ ft (High Altitude Cruise / Widebody)', alt: 41000 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-sans text-slate-100"
      data-testid="help-modal"
    >
      <div className="relative w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Radio className="w-5 h-5 text-sky-400" />
            <h3 className="font-display-radar font-bold text-base tracking-wide">
              PANDUAN AIR RADAR AI &bull; INDONESIA
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Panduan"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Overview */}
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-slate-200 leading-relaxed">
            <strong className="text-sky-300 block mb-1">Tentang Sistem:</strong>
            AIR RADAR AI adalah sistem pelacak posisi pesawat interaktif real-time untuk ruang udara Indonesia (FIR Jakarta dan FIR Ujung Pandang). Terinspirasi dari Flightradar24 dan ADS-B radar modern dengan dukungan telemetry aktual.
          </div>

          {/* Core Features */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Fitur Utama Navigasi:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-sky-400 font-semibold">
                  <Plane className="w-4 h-4" />
                  <span>Klik Pesawat</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Buka dossier lengkap: rute, registrasi PK, kecepatan knots, ketinggian, dan jejak terbang (flight trail).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <Eye className="w-4 h-4" />
                  <span>Kokpit 3D HUD</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Simulasi sudut pandang kaca kokpit pilot dengan artificial horizon, airspeed tape, dan altimeter.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <Building2 className="w-4 h-4" />
                  <span>Bandara &amp; METAR</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Klik pin bandara (CGK, DPS, SUB, UPG, dll.) untuk jadwal keberangkatan, kedatangan, dan info cuaca METAR.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Flight Analytics</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Analisis efisiensi rute, estimasi ETA, prediksi risiko turbulensi awan cumulonimbus (CB).
                </p>
              </div>
            </div>
          </div>

          {/* Altitude Radar Color Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Legenda Warna Ketinggian Pesawat (Radar Altitude):
            </h4>
            <div className="space-y-1">
              {altitudeBands.map((band, idx) => {
                const color = getAltitudeColor(band.alt);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 px-2.5 rounded bg-slate-950/50 border border-slate-800/80"
                  >
                    <span className="text-slate-300 text-[11px]">{band.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded-full shadow" style={{ backgroundColor: color }} />
                      <span className="font-mono-radar text-[10px] text-slate-400">{color}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OpenSky Integration Note */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-400 text-[11px]">
            <span className="text-slate-200 font-semibold block">Integrasi OpenSky Network ADS-B:</span>
            Backend server secara otomatis mem-proxy koordinat dari stasiun penerima sinyal ADS-B. Sistem mendukung mode Hybrid agar selalu menjamin peta tetap penuh dengan pesawat aktif bahkan saat sinyal terbatas.
          </div>
        </div>
      </div>
    </div>
  );
};
