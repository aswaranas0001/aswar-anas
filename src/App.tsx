import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Flight, Airport, FilterOptions, MapTileProvider } from './types/flight';
import { flightFeed, FeedMode } from './services/flightFeed';
import { INDONESIAN_AIRPORTS } from './data/airports';
import { filterFlights } from './utils/aviation';
import { radarAudio } from './utils/soundEffects';

import { RadarMap } from './components/RadarMap';
import { Header } from './components/Header';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { FlightDetailPanel } from './components/FlightDetailPanel';
import { FlightListDrawer } from './components/FlightListDrawer';
import { AirportDetailModal } from './components/AirportDetailModal';
import { CockpitHudModal } from './components/CockpitHudModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { ShareWebsiteModal } from './components/ShareWebsiteModal';

export default function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCockpit, setShowCockpit] = useState(false);
  const [showFlightList, setShowFlightList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Map & Radar Preferences
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('dark-radar');
  const [showRadarSweep, setShowRadarSweep] = useState(true);
  const [showRangeRings, setShowRangeRings] = useState(false);
  const [showAirports, setShowAirports] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Feed Settings
  const [feedMode, setFeedMode] = useState<FeedMode>('hybrid');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // Filters
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    query: '',
    selectedAirlines: [],
    altitudeRange: 'all',
    statusFilter: 'all',
    aircraftType: 'all',
  });

  // Subscribe to live flight telemetry feed
  useEffect(() => {
    flightFeed.start();
    const unsubscribe = flightFeed.subscribe((updatedFlights) => {
      setFlights(updatedFlights);

      // Keep selected flight updated with latest coordinates
      setSelectedFlight((prev) => {
        if (!prev) return null;
        const fresh = updatedFlights.find((f) => f.id === prev.id);
        return fresh || prev;
      });
    });

    return () => {
      unsubscribe();
      flightFeed.stop();
    };
  }, []);

  // Support direct URL deep linking, e.g. ?flight=GA404 or ?airport=CGK
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const flightParam = params.get('flight') || params.get('callsign');
    const airportParam = params.get('airport');

    if (airportParam) {
      const found = INDONESIAN_AIRPORTS.find(
        (a) =>
          a.iata.toLowerCase() === airportParam.toLowerCase() ||
          a.icao.toLowerCase() === airportParam.toLowerCase()
      );
      if (found) {
        setSelectedAirport(found);
      }
    }

    if (flightParam && flights.length > 0) {
      const clean = flightParam.replace(/\s+/g, '').toLowerCase();
      const found = flights.find(
        (f) =>
          f.flightNumber.replace(/\s+/g, '').toLowerCase() === clean ||
          f.callsign.toLowerCase() === clean ||
          f.icao24.toLowerCase() === clean
      );
      if (found) {
        setSelectedFlight(found);
        setIsFollowing(true);
      }
    }
  }, [flights]);

  // Filter flights
  const filteredFlights = useMemo(() => {
    return filterFlights(flights, filterOptions);
  }, [flights, filterOptions]);

  const handleSelectFlight = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
    setSelectedAirport(null);
    radarAudio.playSelectBeep();
  }, []);

  const handleSelectAirport = useCallback((airport: Airport) => {
    setSelectedAirport(airport);
    radarAudio.playSelectBeep();
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    radarAudio.setMuted(next);
    if (!next) {
      radarAudio.playRadarPing();
    }
  }, [isMuted]);

  const handleModeChange = useCallback((mode: FeedMode) => {
    setFeedMode(mode);
    flightFeed.setMode(mode);
  }, []);

  const handleSpeedMultiplierChange = useCallback((speed: number) => {
    setSpeedMultiplier(speed);
    flightFeed.setSpeedMultiplier(speed);
  }, []);

  const handleSaveCredentials = useCallback((auth?: string) => {
    flightFeed.setOpenSkyCredentials(auth);
  }, []);

  const handleFocusAirport = useCallback((iata: string) => {
    const found = INDONESIAN_AIRPORTS.find((a) => a.iata === iata);
    if (found) {
      setSelectedAirport(found);
      radarAudio.playSelectBeep();
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Full Screen Interactive Radar Map */}
      <RadarMap
        flights={filteredFlights}
        selectedFlight={selectedFlight}
        onSelectFlight={handleSelectFlight}
        selectedAirport={selectedAirport}
        onSelectAirport={handleSelectAirport}
        tileProvider={tileProvider}
        showRadarSweep={showRadarSweep}
        showRangeRings={showRangeRings}
        showAirports={showAirports}
        followSelected={isFollowing}
      />

      {/* 2. Top Header Navigation */}
      <Header
        totalFlightsCount={flights.length}
        totalAirportsCount={INDONESIAN_AIRPORTS.length}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onToggleFlightList={() => setShowFlightList(!showFlightList)}
        isFlightListOpen={showFlightList}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHelp={() => setShowHelp(true)}
        onOpenShare={() => setShowShareModal(true)}
      />

      {/* 3. Floating Search and Filter Bar (Top Centered below Header) */}
      <div className="absolute top-14 sm:top-20 inset-x-3 sm:inset-x-auto sm:left-4 z-20 sm:max-w-md pointer-events-none">
        <SearchAndFilterBar
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          tileProvider={tileProvider}
          onTileChange={setTileProvider}
          showRadarSweep={showRadarSweep}
          onToggleRadarSweep={() => setShowRadarSweep(!showRadarSweep)}
          showRangeRings={showRangeRings}
          onToggleRangeRings={() => setShowRangeRings(!showRangeRings)}
          showAirports={showAirports}
          onToggleAirports={() => setShowAirports(!showAirports)}
          totalFlightsCount={flights.length}
          filteredFlightsCount={filteredFlights.length}
        />
      </div>

      {/* 4. Flight Detail Panel (Right Side on Desktop / Bottom Sheet on Mobile) */}
      {selectedFlight && (
        <div className="absolute bottom-0 sm:bottom-4 inset-x-0 sm:inset-x-auto sm:right-4 z-30 pointer-events-auto flex justify-center">
          <FlightDetailPanel
            flight={selectedFlight}
            onClose={() => {
              setSelectedFlight(null);
              setIsFollowing(false);
            }}
            onOpenCockpit={() => setShowCockpit(true)}
            onFollowToggle={() => setIsFollowing(!isFollowing)}
            isFollowing={isFollowing}
            onFocusAirport={handleFocusAirport}
            onOpenShare={() => setShowShareModal(true)}
          />
        </div>
      )}

      {/* 5. Flight List Drawer (Left Side) */}
      {showFlightList && (
        <div className="absolute bottom-0 sm:bottom-4 inset-x-0 sm:inset-x-auto sm:left-4 sm:top-36 z-30 pointer-events-auto flex justify-center">
          <FlightListDrawer
            flights={filteredFlights}
            selectedFlight={selectedFlight}
            onSelectFlight={(flight) => {
              handleSelectFlight(flight);
              setShowFlightList(false);
            }}
            onClose={() => setShowFlightList(false)}
          />
        </div>
      )}

      {/* 6. Airport Detail Modal */}
      {selectedAirport && (
        <AirportDetailModal
          airport={selectedAirport}
          allFlights={flights}
          onClose={() => setSelectedAirport(null)}
          onSelectFlight={handleSelectFlight}
          onFocusMap={() => {
            // Airport centered
          }}
          onOpenShare={() => setShowShareModal(true)}
        />
      )}

      {/* 7. Cockpit 3D Synthetic HUD Modal */}
      {showCockpit && selectedFlight && (
        <CockpitHudModal
          flight={selectedFlight}
          onClose={() => setShowCockpit(false)}
        />
      )}

      {/* 8. Settings Modal */}
      {showSettings && (
        <SettingsModal
          mode={feedMode}
          onModeChange={handleModeChange}
          speedMultiplier={speedMultiplier}
          onSpeedMultiplierChange={handleSpeedMultiplierChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onClose={() => setShowSettings(false)}
          onSaveCredentials={handleSaveCredentials}
        />
      )}

      {/* 9. Help & System Guide Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* 10. Share & Website Link Modal for AIR RADAR AI */}
      {showShareModal && (
        <ShareWebsiteModal
          onClose={() => setShowShareModal(false)}
          selectedFlight={selectedFlight}
          selectedAirport={selectedAirport}
        />
      )}
    </div>
  );
}
