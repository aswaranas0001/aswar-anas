import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Code,
  Globe,
  Plane,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Flight, Airport } from '../types/flight';
import {
  generateShareUrl,
  generateShareText,
  getSocialShareLinks,
  generateEmbedCode,
} from '../utils/share';

interface ShareWebsiteModalProps {
  onClose: () => void;
  selectedFlight?: Flight | null;
  selectedAirport?: Airport | null;
}

type ShareTarget = 'main' | 'flight' | 'airport';

export const ShareWebsiteModal: React.FC<ShareWebsiteModalProps> = ({
  onClose,
  selectedFlight,
  selectedAirport,
}) => {
  const [activeTab, setActiveTab] = useState<ShareTarget>(
    selectedFlight ? 'flight' : selectedAirport ? 'airport' : 'main'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Compute URL and text according to active selection
  const shareOptions = {
    flightNumber: activeTab === 'flight' ? selectedFlight?.flightNumber : undefined,
    airportIata: activeTab === 'airport' ? selectedAirport?.iata : undefined,
  };

  const shareUrl = generateShareUrl(shareOptions);
  const shareText = generateShareText(shareOptions);
  const socialLinks = getSocialShareLinks(shareUrl, shareText);
  const embedCode = generateEmbedCode(shareUrl, 'AIR RADAR AI');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    } catch {
      // noop
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-sans text-slate-100"
      data-testid="share-website-modal"
    >
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display-radar font-bold text-base tracking-wide flex items-center gap-1.5">
                LINK WEBSITE AIR RADAR AI
              </h3>
              <p className="text-[11px] text-slate-400">Bagikan akses radar live pesawat udara Indonesia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Jendela Bagikan"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
          {/* Target Tabs (if flight or airport is active) */}
          {(selectedFlight || selectedAirport) && (
            <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('main')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                  activeTab === 'main'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Radar Utama</span>
              </button>

              {selectedFlight && (
                <button
                  onClick={() => setActiveTab('flight')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    activeTab === 'flight'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span className="truncate">{selectedFlight.flightNumber}</span>
                </button>
              )}

              {selectedAirport && (
                <button
                  onClick={() => setActiveTab('airport')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all ${
                    activeTab === 'airport'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Bandara {selectedAirport.iata}</span>
                </button>
              )}
            </div>
          )}

          {/* Website Link Display & Copy Bar */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Link Resmi Website AIR RADAR AI:</span>
              <span className="text-sky-400 text-[10px] lowercase font-mono-radar">https://</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 font-mono-radar text-xs text-sky-300 truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all ${
                  copiedLink
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/30'
                }`}
                title="Salin link website"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-white font-semibold text-xs flex items-center gap-1.5">
                <span>AIR RADAR AI</span>
                <span className="text-[9px] font-mono-radar px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  LIVE TRACKING
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Platform radar pelacak penerbangan komersial &amp; kargo real-time di seluruh kepulauan Indonesia dengan telemetry ketinggian, rute, dan simulasi kokpit pilot.
              </p>
            </div>
          </div>

          {/* Quick Share to Social Media */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Bagikan Langsung ke:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 transition-colors font-medium text-xs text-center"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-sky-950/50 hover:bg-sky-900/60 border border-sky-600/40 text-sky-300 transition-colors font-medium text-xs text-center"
              >
                <span>Telegram</span>
              </a>

              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors font-medium text-xs text-center"
              >
                <span>X / Twitter</span>
              </a>

              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-600/40 text-blue-300 transition-colors font-medium text-xs text-center"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* QR Code and Embed Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* QR Code Toggle */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs">
                  <QrCode className="w-4 h-4 text-sky-400" />
                  <span>QR Code Akses HP</span>
                </div>
                <button
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline"
                >
                  {showQrCode ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>

              {showQrCode ? (
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg my-1">
                  <img
                    src={qrImageUrl}
                    alt="QR Code AIR RADAR AI"
                    className="w-36 h-36 object-contain"
                  />
                  <span className="text-[10px] text-slate-800 font-medium mt-1">
                    Scan via kamera HP
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Pindai kode QR menggunakan kamera ponsel atau tablet untuk membuka aplikasi radar langsung di layar Anda.
                </p>
              )}
            </div>

            {/* Embed Code Widget */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs mb-1">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Embed HTML / Widget</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Pasang radar interaktif AIR RADAR AI di situs web atau blog penerbangan Anda.
                </p>
              </div>

              <button
                onClick={handleCopyEmbed}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  copiedEmbed
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmbed ? 'Kode Embed Tersalin!' : 'Salin Kode Embed'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>FIR WIIF &amp; FIR WAAF Indonesia</span>
          </div>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold text-xs transition-colors"
          >
            <span>Buka Langsung</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
