import React, { useState, useEffect } from 'react';
import {
  Radio,
  Plane,
  Building2,
  Volume2,
  VolumeX,
  Settings,
  ListFilter,
  Clock,
  HelpCircle,
  Share2,
} from 'lucide-react';

interface HeaderProps {
  totalFlightsCount: number;
  totalAirportsCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleFlightList: () => void;
  isFlightListOpen: boolean;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalFlightsCount,
  totalAirportsCount,
  isMuted,
  onToggleMute,
  onToggleFlightList,
  isFlightListOpen,
  onOpenSettings,
  onOpenHelp,
  onOpenShare,
}) => {
  const [timeStr, setTimeStr] = useState({
    wib: '',
    utc: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMins = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSs = String(now.getUTCSeconds()).padStart(2, '0');

      // WIB = UTC+7
      const wibHours = String((now.getUTCHours() + 7) % 24).padStart(2, '0');

      setTimeStr({
        utc: `${utcHours}:${utcMins}:${utcSs} UTC`,
        wib: `${wibHours}:${utcMins} WIB`,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="absolute top-0 inset-x-0 z-30 pointer-events-none p-3 sm:p-4 flex items-center justify-between">
      {/* Brand & Airspace Badge */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-700/80 shadow-2xl flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-display-radar font-bold text-sm sm:text-base tracking-wider text-white">
                AIR RADAR <span className="text-sky-400">AI</span>
              </h1>
              <span className="hidden sm:inline-block text-[9px] font-mono-radar font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LIVE
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
              Indonesia Aircraft Tracking &bull; FIR WIIF &amp; WAAF
            </p>
          </div>
        </div>

        {/* Quick Airspace Stats (Desktop) */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-700/80 shadow-2xl text-xs font-mono-radar">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-slate-800/80 text-sky-300">
            <Plane className="w-3.5 h-3.5" />
            <span className="font-bold text-white">{totalFlightsCount}</span>
            <span className="text-slate-400 text-[10px]">Pesawat</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-slate-800/80 text-emerald-300">
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-bold text-white">{totalAirportsCount}</span>
            <span className="text-slate-400 text-[10px]">Bandara</span>
          </div>

          <div className="flex items-center space-x-1.5 pl-2 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-200 font-bold">{timeStr.wib}</span>
            <span>({timeStr.utc})</span>
          </div>
        </div>
      </div>

      {/* Top Right Quick Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 pointer-events-auto">
        {/* Toggle Flight List Drawer */}
        <button
          onClick={onToggleFlightList}
          aria-label="Buka daftar penerbangan"
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border backdrop-blur-md shadow-2xl transition-all ${
            isFlightListOpen
              ? 'bg-sky-600 text-white border-sky-400 shadow-sky-600/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
          <span className="hidden sm:inline">Daftar Penerbangan</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono-radar text-sky-300 font-bold border border-slate-700">
            {totalFlightsCount}
          </span>
        </button>

        {/* Share & Website Link Button */}
        <button
          onClick={onOpenShare}
          aria-label="Link Website AIR RADAR AI"
          title="Buka & Salin Link Website AIR RADAR AI"
          className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border bg-gradient-to-r from-sky-600/90 to-blue-600/90 hover:from-sky-500 hover:to-blue-500 text-white border-sky-400/50 shadow-lg shadow-sky-600/20 backdrop-blur-md transition-all active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-200" />
          <span className="hidden md:inline">Link AIR RADAR AI</span>
          <span className="inline md:hidden">Link</span>
        </button>

        {/* Mute/Unmute Audio */}
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Nyalakan audio radar' : 'Bisukan audio radar'}
          title={isMuted ? 'Nyalakan audio radar' : 'Bisukan audio radar'}
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white shadow-2xl transition-colors"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          aria-label="Buka pengaturan"
          title="Pengaturan"
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white shadow-2xl transition-colors"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Help */}
        <button
          onClick={onOpenHelp}
          aria-label="Bantuan dan Panduan Radar"
          title="Panduan Sistem"
          className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white shadow-2xl transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
        </button>
      </div>
    </header>
  );
};
