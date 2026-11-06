import React from 'react';
import { RACING_VEHICLES } from '../data/modulesData';
import { VehicleConfig, VehicleUpgrades, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { sound } from '../utils/audio';
import {
  Wrench,
  Zap,
  Gauge,
  Flame,
  Check,
  Lock,
  ArrowRight
} from 'lucide-react';

interface GarageShopProps {
  playerVehicle: VehicleConfig;
  onSelectVehicle: (v: VehicleConfig) => void;
  unlockedVehicleIds: string[];
  onUnlockVehicle: (id: string, cost: number) => void;
  upgrades: VehicleUpgrades;
  onUpgradePart: (part: 'engine' | 'nitro' | 'aero', cost: number) => void;
  playerColor: string;
  onSelectColor: (color: string) => void;
  coins: number;
  language: Language;
  onStartRace: () => void;
}

const CAR_COLORS = [
  { name: 'Racing Red', hex: '#EF4444' },
  { name: 'Neon Azure', hex: '#3B82F6' },
  { name: 'Emerald Dart', hex: '#10B981' },
  { name: 'Cyber Amber', hex: '#F59E0B' },
  { name: 'Plasma Violet', hex: '#8B5CF6' },
  { name: 'Stealth Black', hex: '#1E293B' }
];

export const GarageShop: React.FC<GarageShopProps> = ({
  playerVehicle,
  onSelectVehicle,
  unlockedVehicleIds,
  onUnlockVehicle,
  upgrades,
  onUpgradePart,
  playerColor,
  onSelectColor,
  coins,
  language,
  onStartRace
}) => {
  const t = TRANSLATIONS[language];

  const getUpgradeCost = (level: number) => level * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              PERFORMANCE TUNING LAB
            </span>
            <span className="text-xs text-slate-400">· STEM Grand Prix</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            {t.garageTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.garageSubtitle}
          </p>
        </div>

        {/* Coins Pill & Start Race CTA */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-300 px-4 py-2 rounded-2xl flex items-center gap-2 font-mono font-bold text-amber-900 text-base shadow-xs">
            <span>🪙</span>
            <span>{coins} {t.coins}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onStartRace();
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <span>{t.enterRaceBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Garage Grid: Car Selection & Tuning Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fleet Selection */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            {t.vehicleFleet}
          </h2>

          <div className="space-y-2.5">
            {RACING_VEHICLES.map((v) => {
              const isUnlocked = unlockedVehicleIds.includes(v.id);
              const isSelected = v.id === playerVehicle.id;

              return (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-xs"
                      style={{ backgroundColor: isSelected ? playerColor : v.color }}
                    >
                      {v.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{v.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Speed: {v.topSpeed}m/s · Accel: {v.acceleration}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-lg">
                        {t.activeTag}
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectVehicle(v);
                        }}
                        className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {t.selectCar}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (coins >= v.price) {
                            sound.playClick();
                            onUnlockVehicle(v.id, v.price);
                          } else {
                            sound.playTryAgain();
                          }
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                          coins >= v.price
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{v.price} 🪙</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Performance Tuning & Parts Upgrade */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Active Vehicle Preview Showcase */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-extrabold tracking-wider text-cyan-400 uppercase">
                CURRENT SPECIFICATION
              </span>
              <h3 className="text-2xl font-black">{playerVehicle.name}</h3>
              <p className="text-xs text-slate-400 max-w-xs">{playerVehicle.description}</p>
            </div>

            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-xl border-4 border-white/20"
              style={{ backgroundColor: playerColor }}
            >
              {playerVehicle.emoji}
            </div>
          </div>

          {/* Color Livery Customizer */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t.carColor}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {CAR_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    sound.playClick();
                    onSelectColor(c.hex);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    playerColor === c.hex
                      ? 'ring-4 ring-blue-500 scale-110 shadow-md'
                      : 'hover:scale-105 opacity-85'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {playerColor === c.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Upgradable Parts */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Part 1: Engine Tuning */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    Engine Bore Tuning ({t.level} {upgrades.engineLevel}/5)
                  </div>
                  <div className="text-xs text-slate-500">
                    +{upgrades.engineLevel * 5}% Base Maximum Velocity
                  </div>
                </div>
              </div>

              {upgrades.engineLevel < 5 ? (
                <button
                  onClick={() => {
                    const cost = getUpgradeCost(upgrades.engineLevel);
                    if (coins >= cost) {
                      sound.playClick();
                      onUpgradePart('engine', cost);
                    } else {
                      sound.playTryAgain();
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    coins >= getUpgradeCost(upgrades.engineLevel)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({getUpgradeCost(upgrades.engineLevel)} 🪙)
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {t.maxLevel}
                </span>
              )}
            </div>

            {/* Part 2: Nitro Tank */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    Nitro Supercharge Injector ({t.level} {upgrades.nitroLevel}/5)
                  </div>
                  <div className="text-xs text-slate-500">
                    +{upgrades.nitroLevel * 8}% Nitro Boost Acceleration Surge
                  </div>
                </div>
              </div>

              {upgrades.nitroLevel < 5 ? (
                <button
                  onClick={() => {
                    const cost = getUpgradeCost(upgrades.nitroLevel);
                    if (coins >= cost) {
                      sound.playClick();
                      onUpgradePart('nitro', cost);
                    } else {
                      sound.playTryAgain();
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    coins >= getUpgradeCost(upgrades.nitroLevel)
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({getUpgradeCost(upgrades.nitroLevel)} 🪙)
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {t.maxLevel}
                </span>
              )}
            </div>

            {/* Part 3: Aerodynamics */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    Carbon Aero Winglet ({t.level} {upgrades.aeroLevel}/5)
                  </div>
                  <div className="text-xs text-slate-500">
                    Reduces drag and increases launch gate acceleration
                  </div>
                </div>
              </div>

              {upgrades.aeroLevel < 5 ? (
                <button
                  onClick={() => {
                    const cost = getUpgradeCost(upgrades.aeroLevel);
                    if (coins >= cost) {
                      sound.playClick();
                      onUpgradePart('aero', cost);
                    } else {
                      sound.playTryAgain();
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    coins >= getUpgradeCost(upgrades.aeroLevel)
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({getUpgradeCost(upgrades.aeroLevel)} 🪙)
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {t.maxLevel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
