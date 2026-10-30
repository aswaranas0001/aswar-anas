import React, { useState } from 'react';
import {
  Search,
  X,
  Filter,
  Layers,
  SlidersHorizontal,
  Compass,
  Radio,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { FilterOptions, MapTileProvider } from '../types/flight';
import { AIRLINES } from '../data/airports';

interface SearchAndFilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
  tileProvider: MapTileProvider;
  onTileChange: (tile: MapTileProvider) => void;
  showRadarSweep: boolean;
  onToggleRadarSweep: () => void;
  showRangeRings: boolean;
  onToggleRangeRings: () => void;
  showAirports: boolean;
  onToggleAirports: () => void;
  totalFlightsCount: number;
  filteredFlightsCount: number;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  filterOptions,
  onFilterChange,
  tileProvider,
  onTileChange,
  showRadarSweep,
  onToggleRadarSweep,
  showRangeRings,
  onToggleRangeRings,
  showAirports,
  onToggleAirports,
  totalFlightsCount,
  filteredFlightsCount,
}) => {
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);

  const toggleAirline = (code: string) => {
    const current = filterOptions.selectedAirlines;
    const exists = current.includes(code);
    const updated = exists ? current.filter((c) => c !== code) : [...current, code];
    onFilterChange({ ...filterOptions, selectedAirlines: updated });
  };

  const clearAllFilters = () => {
    onFilterChange({
      query: '',
      selectedAirlines: [],
      altitudeRange: 'all',
      statusFilter: 'all',
      aircraftType: 'all',
    });
  };

  const hasActiveFilters =
    filterOptions.query !== '' ||
    filterOptions.selectedAirlines.length > 0 ||
    filterOptions.altitudeRange !== 'all' ||
    filterOptions.statusFilter !== 'all' ||
    filterOptions.aircraftType !== 'all';

  return (
    <div className="flex flex-col space-y-2 pointer-events-auto">
      {/* Main Search Input & Quick Controls */}
      <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl">
        <div className="relative flex-1 flex items-center min-w-[220px] sm:min-w-[360px]">
          <Search className="w-4 h-4 text-sky-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={filterOptions.query}
            onChange={(e) => onFilterChange({ ...filterOptions, query: e.target.value })}
            placeholder="Cari penerbangan, rute, maskapai (GA404, DPS, Lion)..."
            aria-label="Cari penerbangan"
            className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors font-sans"
          />
          {filterOptions.query && (
            <button
              onClick={() => onFilterChange({ ...filterOptions, query: '' })}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          aria-label="Buka filter lanjutan"
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
            hasActiveFilters
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm shadow-sky-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          )}
        </button>

        {/* Layers / Map Provider Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayersDropdown(!showLayersDropdown)}
            aria-label="Ganti mode peta dan layer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Layer</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLayersDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Tampilan Peta
              </div>
              <div className="grid grid-cols-2 gap-1">
                {(
                  [
                    { id: 'dark-radar', label: 'Dark Radar' },
                    { id: 'satellite', label: 'Satelit' },
                    { id: 'aviation-light', label: 'Terang' },
                    { id: 'street', label: 'Jalanan' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTileChange(item.id);
                      setShowLayersDropdown(false);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-left text-xs font-medium transition-colors ${
                      tileProvider === item.id
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Fitur Radar
                </div>

                <label className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center space-x-2 text-slate-300">
                    <Radio className="w-3.5 h-3.5 text-sky-400" />
                    <span>Animasi Radar Sweep</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showRadarSweep}
                    onChange={onToggleRadarSweep}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center space-x-2 text-slate-300">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>Lingkaran Jangkauan (Rings)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showRangeRings}
                    onChange={onToggleRangeRings}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center space-x-2 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ikon Bandara Indonesia</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showAirports}
                    onChange={onToggleAirports}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilterDrawer && (
        <div className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Filter Penerbangan ({filteredFlightsCount} dari {totalFlightsCount})</span>
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium"
              >
                Reset Semua
              </button>
            )}
          </div>

          {/* Maskapai Chips */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Maskapai:</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(AIRLINES).slice(0, 8).map((airline) => {
                const active = filterOptions.selectedAirlines.includes(airline.code);
                return (
                  <button
                    key={airline.code}
                    onClick={() => toggleAirline(airline.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                      active
                        ? 'bg-sky-600 text-white border-sky-400'
                        : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: airline.color }}
                    />
                    <span>{airline.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Altitude Range Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Ketinggian:</div>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'high', label: 'Tinggi (>25k ft)' },
                  { id: 'mid', label: 'Sedang (10-25k)' },
                  { id: 'low', label: 'Rendah (<10k)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      onFilterChange({ ...filterOptions, altitudeRange: item.id as any })
                    }
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      filterOptions.altitudeRange === item.id
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Tipe Pesawat:</div>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'jets', label: 'Jet (A320/B737)' },
                  { id: 'widebody', label: 'Widebody (B777/A330)' },
                  { id: 'turboprop', label: 'Turboprop (ATR)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      onFilterChange({ ...filterOptions, aircraftType: item.id as any })
                    }
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      filterOptions.aircraftType === item.id
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
