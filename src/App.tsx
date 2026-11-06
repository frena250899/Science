/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CHAMPIONSHIP_CIRCUITS, RACING_VEHICLES } from './data/modulesData';
import { CircuitTrack, VehicleConfig, VehicleUpgrades, Language } from './types/game';
import { TRANSLATIONS } from './utils/i18n';
import { Navbar } from './components/Navbar';
import { TopicHub } from './components/TopicHub';
import { GrandPrixRaceArena } from './components/GrandPrixRaceArena';
import { GarageShop } from './components/GarageShop';
import { SpeedDuelMode } from './components/SpeedDuelMode';
import { SpeedBlitzMode } from './components/SpeedBlitzMode';
import { SandboxMode } from './components/SandboxMode';
import { AchievementsModal } from './components/AchievementsModal';
import { sound } from './utils/audio';

export default function App() {
  const [currentView, setCurrentView] = useState<'hub' | 'race' | 'garage' | 'duel' | 'blitz' | 'sandbox'>('hub');
  const [activeCircuit, setActiveCircuit] = useState<CircuitTrack>(CHAMPIONSHIP_CIRCUITS[0]);

  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('stem_racing_lang') as Language) || 'en';
  });

  const t = TRANSLATIONS[language];

  // Coins & XP state with local storage persistence
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('stem_racing_coins');
    return saved !== null ? parseInt(saved, 10) : 300; // Starter coins for upgrades
  });

  const [xp, setXP] = useState<number>(() => {
    const saved = localStorage.getItem('stem_racing_xp');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Selected Player Car & Color
  const [playerVehicle, setPlayerVehicle] = useState<VehicleConfig>(RACING_VEHICLES[0]);
  const [playerColor, setPlayerColor] = useState<string>('#EF4444');

  // Unlocked vehicles
  const [unlockedVehicleIds, setUnlockedVehicleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stem_racing_unlocked_cars');
      return saved ? JSON.parse(saved) : ['racecar', 'cheetah'];
    } catch {
      return ['racecar', 'cheetah'];
    }
  });

  // Performance Upgrades (Engine, Nitro, Aero)
  const [upgrades, setUpgrades] = useState<VehicleUpgrades>(() => {
    try {
      const saved = localStorage.getItem('stem_racing_upgrades');
      return saved ? JSON.parse(saved) : { engineLevel: 1, nitroLevel: 1, aeroLevel: 1 };
    } catch {
      return { engineLevel: 1, nitroLevel: 1, aeroLevel: 1 };
    }
  });

  // Unlocked achievements list
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('stem_racing_achievements');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);

  const unlockAchievement = (id: string) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('stem_racing_achievements', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'id' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('stem_racing_lang', nextLang);
    unlockAchievement('bilingual');
  };

  // Add Coins & XP
  const addEarnings = (earnedCoins: number, earnedXP: number) => {
    setCoins((prev) => {
      const next = prev + earnedCoins;
      localStorage.setItem('stem_racing_coins', next.toString());
      return next;
    });
    setXP((prev) => {
      const next = prev + earnedXP;
      localStorage.setItem('stem_racing_xp', next.toString());
      return next;
    });
  };

  // Unlock Car Handler
  const handleUnlockVehicle = (vehicleId: string, cost: number) => {
    if (coins < cost) return;
    setCoins((prev) => {
      const next = prev - cost;
      localStorage.setItem('stem_racing_coins', next.toString());
      return next;
    });
    setUnlockedVehicleIds((prev) => {
      const next = [...prev, vehicleId];
      localStorage.setItem('stem_racing_unlocked_cars', JSON.stringify(next));
      return next;
    });
  };

  // Part Upgrade Handler
  const handleUpgradePart = (part: 'engine' | 'nitro' | 'aero', cost: number) => {
    if (coins < cost) return;
    setCoins((prev) => {
      const next = prev - cost;
      localStorage.setItem('stem_racing_coins', next.toString());
      return next;
    });
    setUpgrades((prev) => {
      const next = {
        ...prev,
        [part === 'engine' ? 'engineLevel' : part === 'nitro' ? 'nitroLevel' : 'aeroLevel']:
          prev[part === 'engine' ? 'engineLevel' : part === 'nitro' ? 'nitroLevel' : 'aeroLevel'] + 1
      };
      localStorage.setItem('stem_racing_upgrades', JSON.stringify(next));
      return next;
    });
  };

  // Race finished callback
  const handleRaceFinished = (rank: number, earnedCoins: number, earnedXP: number) => {
    addEarnings(earnedCoins, earnedXP);
    unlockAchievement('first_solve');
    if (rank === 1) {
      unlockAchievement('master_cert');
    }
  };

  const handleStartCircuit = (circuit: CircuitTrack) => {
    setActiveCircuit(circuit);
    setCurrentView('race');
  };

  const handleNextCircuit = () => {
    const currentIdx = CHAMPIONSHIP_CIRCUITS.findIndex((c) => c.id === activeCircuit.id);
    const nextIdx = (currentIdx + 1) % CHAMPIONSHIP_CIRCUITS.length;
    setActiveCircuit(CHAMPIONSHIP_CIRCUITS[nextIdx]);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900 selection:bg-rose-100">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        coins={coins}
        xp={xp}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        unlockedAchievementsCount={unlockedAchievements.length}
      />

      {/* Main Game Screen */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: RACING HEADQUARTERS (GRAND PRIX HUB) */}
        {currentView === 'hub' && (
          <TopicHub
            onStartCircuit={handleStartCircuit}
            onOpenGarage={() => setCurrentView('garage')}
            onOpenDuel={() => setCurrentView('duel')}
            onOpenBlitz={() => setCurrentView('blitz')}
            onOpenSandbox={() => setCurrentView('sandbox')}
            playerVehicle={playerVehicle}
            playerColor={playerColor}
            coins={coins}
            xp={xp}
            language={language}
          />
        )}

        {/* VIEW 2: LIVE GRAND PRIX CIRCUIT RACE */}
        {currentView === 'race' && (
          <GrandPrixRaceArena
            circuit={activeCircuit}
            playerVehicle={playerVehicle}
            playerColor={playerColor}
            upgrades={upgrades}
            language={language}
            onRaceFinished={handleRaceFinished}
            onNextCircuit={handleNextCircuit}
            onReturnToHub={() => setCurrentView('hub')}
          />
        )}

        {/* VIEW 3: GARAGE & PERFORMANCE TUNING */}
        {currentView === 'garage' && (
          <GarageShop
            playerVehicle={playerVehicle}
            onSelectVehicle={(v) => setPlayerVehicle(v)}
            unlockedVehicleIds={unlockedVehicleIds}
            onUnlockVehicle={handleUnlockVehicle}
            upgrades={upgrades}
            onUpgradePart={handleUpgradePart}
            playerColor={playerColor}
            onSelectColor={(hex) => setPlayerColor(hex)}
            coins={coins}
            language={language}
            onStartRace={() => setCurrentView('race')}
          />
        )}

        {/* VIEW 4: HEAD-TO-HEAD DRAG DUEL */}
        {currentView === 'duel' && (
          <SpeedDuelMode
            onBackToHub={() => setCurrentView('hub')}
            language={language}
            onEarnXP={(xpEarned) => {
              addEarnings(Math.round(xpEarned * 1.5), xpEarned);
              unlockAchievement('duel_winner');
            }}
          />
        )}

        {/* VIEW 5: 60-SECOND NITRO RUSH */}
        {currentView === 'blitz' && (
          <SpeedBlitzMode
            onBackToHub={() => setCurrentView('hub')}
            language={language}
            onEarnXP={(xpEarned) => {
              addEarnings(Math.round(xpEarned * 1.2), xpEarned);
              unlockAchievement('blitz_master');
            }}
          />
        )}

        {/* VIEW 6: FREE TEST TRACK (SANDBOX) */}
        {currentView === 'sandbox' && (
          <SandboxMode
            onBackToHub={() => setCurrentView('hub')}
            language={language}
          />
        )}
      </main>

      {/* Racing Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{t.appTitle}</span>
            <span>·</span>
            <span>Grade 7 Kinematics & Physical Science Racing Academy</span>
          </div>
          <div className="flex items-center gap-3 font-mono font-medium text-slate-600">
            <span>v = d ÷ t (m/s)</span>
            <span>·</span>
            <span className="text-amber-600 font-bold">Turbo Nitro Boost Active</span>
          </div>
        </div>
      </footer>

      {/* Trophy Room Modal */}
      {isAchievementsOpen && (
        <AchievementsModal
          onClose={() => setIsAchievementsOpen(false)}
          language={language}
          unlockedIds={unlockedAchievements}
        />
      )}
    </div>
  );
}
