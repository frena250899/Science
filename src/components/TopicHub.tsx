import React from 'react';
import { CHAMPIONSHIP_CIRCUITS } from '../data/modulesData';
import { CircuitTrack, VehicleConfig, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { sound } from '../utils/audio';
import {
  Trophy,
  Wrench,
  Zap,
  Play,
  Sliders,
  Flag,
  Flame,
  Star
} from 'lucide-react';

interface TopicHubProps {
  onStartCircuit: (circuit: CircuitTrack) => void;
  onOpenGarage: () => void;
  onOpenDuel: () => void;
  onOpenBlitz: () => void;
  onOpenSandbox: () => void;
  playerVehicle: VehicleConfig;
  playerColor: string;
  coins: number;
  xp: number;
  language: Language;
}

export const TopicHub: React.FC<TopicHubProps> = ({
  onStartCircuit,
  onOpenGarage,
  onOpenDuel,
  onOpenBlitz,
  onOpenSandbox,
  playerVehicle,
  playerColor,
  coins,
  xp,
  language
}) => {
  const t = TRANSLATIONS[language];

  const getRacerRank = (points: number) => {
    if (language === 'id') {
      if (points >= 600) return { title: 'Juara Legenda Grand Prix', tier: 'Pembalap Kelas S', badge: 'bg-amber-100 text-amber-800' };
      if (points >= 250) return { title: 'Pembalap Pro Kejuaraan', tier: 'Pembalap Kelas A', badge: 'bg-blue-100 text-blue-800' };
      return { title: 'Pembalap Debutan Rookie', tier: 'Pembalap Kelas B', badge: 'bg-emerald-100 text-emerald-800' };
    }
    if (points >= 600) return { title: 'Grand Prix Champion', tier: 'S-Class Legend', badge: 'bg-amber-100 text-amber-800' };
    if (points >= 250) return { title: 'Pro Championship Driver', tier: 'A-Class Racer', badge: 'bg-blue-100 text-blue-800' };
    return { title: 'Rookie Speed Recruit', tier: 'B-Class Driver', badge: 'bg-emerald-100 text-emerald-800' };
  };

  const rank = getRacerRank(xp);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* High-Octane Grand Prix Racing Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-700 to-indigo-900 text-white p-6 sm:p-10 shadow-xl">
        {/* Checkered flag aesthetic accent */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.06),rgba(255,255,255,0.06)_15px,transparent_15px,transparent_30px)] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-300 border border-white/20">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{t.racingAcademyTag}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight font-display">
              {t.gpTitle}
            </h1>
            <p className="text-sm sm:text-base text-rose-100 font-medium leading-relaxed">
              {t.gpSubtitle}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onStartCircuit(CHAMPIONSHIP_CIRCUITS[0]);
                }}
                className="px-6 py-3 bg-white text-rose-700 hover:bg-rose-50 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t.enterRaceBtn}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenGarage();
                }}
                className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-xl border border-white/30 backdrop-blur-sm transition-colors flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>{t.garageBtn}</span>
              </button>
            </div>
          </div>

          {/* Active Car & Racer Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-extrabold tracking-wider text-rose-200">
                {t.racerProfile}
              </span>
              <Trophy className="w-4 h-4 text-amber-300" />
            </div>

            <div>
              <div className="text-lg font-black text-white">{rank.title}</div>
              <div className="text-xs text-rose-200">{rank.tier}</div>
            </div>

            {/* Active Car Preview */}
            <div className="bg-white/15 rounded-xl p-3 flex items-center justify-between border border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-200 block">{t.currentCar}</span>
                <span className="font-bold text-sm text-white">{playerVehicle.name}</span>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-md border border-white/30"
                style={{ backgroundColor: playerColor }}
              >
                {playerVehicle.emoji}
              </div>
            </div>

            {/* Bank of Coins & XP */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300 bg-black/20 p-2.5 rounded-xl border border-white/10">
              <span>🪙 {coins} {t.coins}</span>
              <span>⭐ {xp} {t.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Game Modes: Head-to-Head Duel, 60s Nitro Rush, Free Sandbox */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode 1: Drag Duel */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenDuel();
          }}
          className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-5 border border-purple-700/50 shadow-md hover:shadow-lg cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 uppercase">
              2-PLAYER DUEL
            </span>
            <h3 className="text-base font-bold">{t.duelTitle}</h3>
            <p className="text-xs text-purple-200">
              {language === 'id' ? 'Bandingkan kelajuan dan tebak pemenang balapan drag!' : 'Compare speeds and predict the drag race winner!'}
            </p>
          </div>
          <span className="text-3xl">🏎️💨</span>
        </div>

        {/* Mode 2: 60s Nitro Rush */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenBlitz();
          }}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-5 border border-amber-500/50 shadow-md hover:shadow-lg cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400/30 text-amber-100 uppercase">
              60s TIME ATTACK
            </span>
            <h3 className="text-base font-bold">{t.blitzTitle}</h3>
            <p className="text-xs text-amber-100">
              {language === 'id' ? 'Hitung cepat kelajuan dan balap mobil sebanyak mungkin!' : 'Rapid-fire speed division to overtake rival cars!'}
            </p>
          </div>
          <span className="text-3xl">⚡</span>
        </div>

        {/* Mode 3: Free Test Track */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenSandbox();
          }}
          className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 border border-emerald-700/50 shadow-md hover:shadow-lg cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-200 uppercase">
              LAB TEST TRACK
            </span>
            <h3 className="text-base font-bold">{t.navSandbox}</h3>
            <p className="text-xs text-emerald-200">
              {language === 'id' ? 'Atur bebas jarak dan kelajuan sesukamu!' : 'Freely adjust distance and velocity on open track!'}
            </p>
          </div>
          <Sliders className="w-8 h-8 text-emerald-300" />
        </div>
      </div>

      {/* GRAND PRIX CHAMPIONSHIP CIRCUITS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
              <Flag className="w-5 h-5 text-rose-600" />
              <span>{t.availableCircuits}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'id'
                ? 'Selesaikan setiap sirkuit dengan menghitung kelajuan telemetri dan menangkan piala!'
                : 'Conquer each championship circuit by calculating velocity to trigger Nitro!'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHAMPIONSHIP_CIRCUITS.map((circuit, idx) => (
            <div
              key={circuit.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Circuit Header */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    STAGE 0{idx + 1} · {circuit.difficulty.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(idx + 1)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {language === 'id' ? circuit.nameId : circuit.name}
                </h3>

                {/* Circuit Stats Strip */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.circuitDistance}:</span>
                    <span className="font-mono font-bold text-slate-800">{circuit.distance} meters (m)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.circuitTime}:</span>
                    <span className="font-mono font-bold text-slate-800">{circuit.time} seconds (s)</span>
                  </div>
                  <div className="flex justify-between text-blue-700 font-semibold pt-1 border-t border-slate-200">
                    <span>{t.circuitSpeed}:</span>
                    <span className="font-mono font-bold">{circuit.correctSpeed} m/s</span>
                  </div>
                </div>

                {/* Rival Opponents */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {language === 'id' ? 'Lawan di Lintasan:' : 'Rivals on Track:'}
                  </span>
                  <div className="flex items-center gap-2">
                    {circuit.rivals.map((r, ri) => (
                      <span
                        key={ri}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200"
                      >
                        {r.emoji} {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Race Action Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-700">
                  +{circuit.rewardCoins} 🪙 · +{circuit.rewardXP} XP
                </span>

                <button
                  onClick={() => {
                    sound.playClick();
                    onStartCircuit(circuit);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.enterRaceBtn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
