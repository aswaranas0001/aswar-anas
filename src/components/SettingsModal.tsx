import React, { useState } from 'react';
import {
  X,
  Settings,
  Radio,
  Volume2,
  VolumeX,
  Zap,
  Key,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { FeedMode } from '../services/flightFeed';

interface SettingsModalProps {
  mode: FeedMode;
  onModeChange: (mode: FeedMode) => void;
  speedMultiplier: number;
  onSpeedMultiplierChange: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onSaveCredentials: (authHeader?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  mode,
  onModeChange,
  speedMultiplier,
  onSpeedMultiplierChange,
  isMuted,
  onToggleMute,
  onClose,
  onSaveCredentials,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAuth = () => {
    if (username.trim() && password.trim()) {
      const basic = 'Basic ' + btoa(`${username.trim()}:${password.trim()}`);
      onSaveCredentials(basic);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } else {
      onSaveCredentials(undefined);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-sans text-slate-100"
      data-testid="settings-modal"
    >
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Settings className="w-5 h-5 text-sky-400" />
            <h3 className="font-display-radar font-bold text-base tracking-wide">
              PENGATURAN AIR RADAR AI
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Pengaturan"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Feed Source */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 block text-xs">
              Sumber Data Radar Pesawat:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'hybrid',
                  title: 'Hybrid (Rekomendasi)',
                  desc: 'Kombinasi ADS-B Nyata + Rute Aktif Indonesia',
                },
                {
                  id: 'opensky-live',
                  title: 'OpenSky Live ADS-B',
                  desc: 'Hanya sensor sinyal ADS-B aktual',
                },
                {
                  id: 'simulation',
                  title: 'Simulasi Terkendali',
                  desc: 'Rute penerbangan terjadwal FIR Indonesia',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onModeChange(item.id as FeedMode)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    mode === item.id
                      ? 'bg-sky-600/30 border-sky-400 text-white shadow-md'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5">{item.title}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulation / Animation Speed */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200 block text-xs">
              Kecepatan Simulasi Pergerakan:
            </label>
            <div className="flex space-x-2">
              {[
                { val: 1, label: '1x (Real-time Nyata)' },
                { val: 2, label: '2x (Cepat)' },
                { val: 5, label: '5x (Uji Coba Cepat)' },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => onSpeedMultiplierChange(s.val)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    speedMultiplier === s.val
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Sound Effects */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200 block text-xs">
              Efek Suara Radar Audio:
            </label>
            <button
              onClick={onToggleMute}
              className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between transition-all ${
                !isMuted
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <span className="flex items-center space-x-2">
                {!isMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                <span className="font-medium text-xs">
                  {!isMuted ? 'Suara Radar Aktif (Ping & Notifikasi)' : 'Suara Radar Senyap (Muted)'}
                </span>
              </span>
              <span className="text-[11px] font-bold">
                {!isMuted ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </button>
          </div>

          {/* OpenSky Network Auth (Optional) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Akun OpenSky Network (Opsional):</span>
              </label>
              <a
                href="https://opensky-network.org"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1"
              >
                <span>Daftar Gratis</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Pengguna tanpa akun memiliki batas kuota API publik. Masukkan akun terdaftar jika Anda memiliki kredensial OpenSky untuk kuota lebih tinggi.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Username OpenSky"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleSaveAuth}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Simpan Kredensial OpenSky
            </button>

            {savedSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center font-semibold text-[11px]">
                Kredensial berhasil disimpan!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
