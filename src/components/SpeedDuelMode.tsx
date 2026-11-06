import React, { useState, useRef } from 'react';
import { TEST_VEHICLES } from '../data/modulesData';
import { DuelRound, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { sound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import {
  Trophy,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';

interface SpeedDuelModeProps {
  onBackToHub: () => void;
  language: Language;
  onEarnXP: (xp: number) => void;
}

const DUEL_ROUNDS: DuelRound[] = [
  {
    id: 1,
    title: 'Match 1: Asphalt Cruiser vs Robotic Sprinter',
    vehicleA: TEST_VEHICLES.racecar,
    distanceA: 80,
    timeA: 4.0,
    speedA: 20, // 20 m/s
    vehicleB: TEST_VEHICLES.cheetah,
    distanceB: 75,
    timeB: 3.0,
    speedB: 25, // 25 m/s -> Winner B!
    winner: 'B'
  },
  {
    id: 2,
    title: 'Match 2: Agile Skater vs Airborne Quadcopter',
    vehicleA: TEST_VEHICLES.skater,
    distanceA: 60,
    timeA: 4.0,
    speedA: 15, // 15 m/s
    vehicleB: TEST_VEHICLES.drone,
    distanceB: 60,
    timeB: 5.0,
    speedB: 12, // 12 m/s -> Winner A!
    winner: 'A'
  },
  {
    id: 3,
    title: 'Match 3: Sky Drone vs Experimental Thruster',
    vehicleA: TEST_VEHICLES.drone,
    distanceA: 90,
    timeA: 3.0,
    speedA: 30, // 30 m/s
    vehicleB: TEST_VEHICLES.rocket,
    distanceB: 120,
    timeB: 4.0,
    speedB: 30, // 30 m/s -> Tie!
    winner: 'TIE'
  },
  {
    id: 4,
    title: 'Grand Championship: Cyber Cheetah vs Rocket Kart',
    vehicleA: TEST_VEHICLES.cheetah,
    distanceA: 100,
    timeA: 4.0,
    speedA: 25, // 25 m/s
    vehicleB: TEST_VEHICLES.rocket,
    distanceB: 140,
    timeB: 4.0,
    speedB: 35, // 35 m/s -> Winner B!
    winner: 'B'
  }
];

export const SpeedDuelMode: React.FC<SpeedDuelModeProps> = ({
  onBackToHub,
  language,
  onEarnXP
}) => {
  const t = TRANSLATIONS[language];
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [selectedPrediction, setSelectedPrediction] = useState<'A' | 'B' | 'TIE' | null>(null);
  const [speedInputA, setSpeedInputA] = useState<string>('');
  const [speedInputB, setSpeedInputB] = useState<string>('');

  const [raceState, setRaceState] = useState<'idle' | 'countdown' | 'racing' | 'finished'>('idle');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [progressA, setProgressA] = useState<number>(0);
  const [progressB, setProgressB] = useState<number>(0);
  const [hasScored, setHasScored] = useState<boolean>(false);

  const duel = DUEL_ROUNDS[currentRoundIdx] || DUEL_ROUNDS[0];

  const animRef = useRef<number | null>(null);

  const resetMatch = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setRaceState('idle');
    setProgressA(0);
    setProgressB(0);
    setSelectedPrediction(null);
    setSpeedInputA('');
    setSpeedInputB('');
    setHasScored(false);
  };

  const handleStartDuel = () => {
    if (!selectedPrediction || raceState !== 'idle') return;

    sound.playClick();
    setRaceState('countdown');
    setCountdownNum(3);
    sound.playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
        sound.playCountdownBeep(false);
      } else if (count === 0) {
        setCountdownNum(0);
        sound.playCountdownBeep(true);
      } else {
        clearInterval(interval);
        startRacingAnimation();
      }
    }, 700);
  };

  const startRacingAnimation = () => {
    setRaceState('racing');
    sound.playVehicleStart(1);

    const startTime = performance.now();
    // Use target times from the round
    const durA = duel.timeA * 900;
    const durB = duel.timeB * 900;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progA = Math.min(1, elapsed / durA);
      const progB = Math.min(1, elapsed / durB);

      setProgressA(progA);
      setProgressB(progB);

      if (progA < 1 || progB < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        // Race Finished!
        setRaceState('finished');
        sound.playFinishLine();

        const isUserCorrect = selectedPrediction === duel.winner;
        if (isUserCorrect && !hasScored) {
          sound.playCorrectFanfare();
          fireConfetti(2200);
          onEarnXP(150);
          setHasScored(true);
        } else if (!isUserCorrect) {
          sound.playTryAgain();
        }
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  const isPredictionCorrect = selectedPrediction === duel.winner;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToHub();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                HEAD-TO-HEAD SPEED DUEL
              </span>
              <span className="text-xs text-slate-400">· Match {currentRoundIdx + 1} of {DUEL_ROUNDS.length}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {duel.title}
            </h1>
          </div>
        </div>

        <button
          onClick={resetMatch}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t.reset}
        </button>
      </div>

      {/* Duel Description */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white mb-1">
            {t.predictWinner}
          </h2>
          <p className="text-xs text-purple-200">
            {t.duelSubtitle} Formula: <code className="bg-white/10 px-1 py-0.5 rounded font-mono font-bold text-white">v = d ÷ t</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-xl">
            🏆 +150 XP on Correct Prediction!
          </span>
        </div>
      </div>

      {/* Side-by-Side Calculation Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Track Alpha Data */}
        <div className={`p-5 rounded-2xl border transition-all ${selectedPrediction === 'A' ? 'bg-blue-50/70 border-blue-500 shadow-sm' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{duel.vehicleA.emoji}</span>
              <div>
                <span className="font-bold text-slate-900 text-sm block">{duel.vehicleA.name}</span>
                <span className="text-[11px] text-blue-600 font-semibold">{t.vehicleA}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Distance & Time:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{duel.distanceA}m in {duel.timeA}s</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {t.speedLabel} (v = {duel.distanceA} ÷ {duel.timeA}):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="0.0"
                  value={speedInputA}
                  onChange={(e) => setSpeedInputA(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs font-mono font-bold text-slate-400">m/s</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setSelectedPrediction('A');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all self-end ${
                selectedPrediction === 'A'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {duel.vehicleA.name} {t.winsPrompt}
            </button>
          </div>
        </div>

        {/* Track Beta Data */}
        <div className={`p-5 rounded-2xl border transition-all ${selectedPrediction === 'B' ? 'bg-purple-50/70 border-purple-500 shadow-sm' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{duel.vehicleB.emoji}</span>
              <div>
                <span className="font-bold text-slate-900 text-sm block">{duel.vehicleB.name}</span>
                <span className="text-[11px] text-purple-600 font-semibold">{t.vehicleB}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Distance & Time:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{duel.distanceB}m in {duel.timeB}s</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                {t.speedLabel} (v = {duel.distanceB} ÷ {duel.timeB}):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="0.0"
                  value={speedInputB}
                  onChange={(e) => setSpeedInputB(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:border-purple-500"
                />
                <span className="text-xs font-mono font-bold text-slate-400">m/s</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setSelectedPrediction('B');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all self-end ${
                selectedPrediction === 'B'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {duel.vehicleB.name} {t.winsPrompt}
            </button>
          </div>
        </div>
      </div>

      {/* Tie Option */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            sound.playClick();
            setSelectedPrediction('TIE');
          }}
          className={`px-6 py-2 rounded-xl text-xs font-semibold border transition-all ${
            selectedPrediction === 'TIE'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          🤝 Both vehicles have equal speed (Tie Race!)
        </button>
      </div>

      {/* Dual Animated Drag Strip Arena */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 relative overflow-hidden select-none">
        {/* Countdown Overlay */}
        {raceState === 'countdown' && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
            <div className="text-6xl sm:text-7xl font-mono font-extrabold text-amber-400 animate-ping">
              {countdownNum > 0 ? countdownNum : 'GO!'}
            </div>
          </div>
        )}

        {/* Lane 1: Vehicle A */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold text-blue-400">LANE 1: {duel.vehicleA.name}</span>
            <span className="font-mono">Speed: {duel.speedA} m/s ({duel.distanceA}m ÷ {duel.timeA}s)</span>
          </div>

          <div className="h-16 bg-slate-800 rounded-xl relative flex items-center px-6 border border-slate-700">
            {/* Dashed line */}
            <div className="w-full border-b border-dashed border-slate-600"></div>

            {/* Finish Gate Decal */}
            <div className="absolute right-6 top-1 bottom-1 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)] opacity-60"></div>

            {/* Vehicle A */}
            <div
              className="absolute transform -translate-x-1/2 transition-transform duration-75 text-3xl"
              style={{ left: `calc(1.5rem + ${progressA} * (100% - 3rem))` }}
            >
              {duel.vehicleA.emoji}
            </div>
          </div>
        </div>

        {/* Lane 2: Vehicle B */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-bold text-purple-400">LANE 2: {duel.vehicleB.name}</span>
            <span className="font-mono">Speed: {duel.speedB} m/s ({duel.distanceB}m ÷ {duel.timeB}s)</span>
          </div>

          <div className="h-16 bg-slate-800 rounded-xl relative flex items-center px-6 border border-slate-700">
            {/* Dashed line */}
            <div className="w-full border-b border-dashed border-slate-600"></div>

            {/* Finish Gate Decal */}
            <div className="absolute right-6 top-1 bottom-1 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)] opacity-60"></div>

            {/* Vehicle B */}
            <div
              className="absolute transform -translate-x-1/2 transition-transform duration-75 text-3xl"
              style={{ left: `calc(1.5rem + ${progressB} * (100% - 3rem))` }}
            >
              {duel.vehicleB.emoji}
            </div>
          </div>
        </div>
      </div>

      {/* Start Button & Result Feedback */}
      <div className="flex flex-col items-center gap-4">
        {raceState === 'idle' && (
          <button
            onClick={handleStartDuel}
            disabled={!selectedPrediction}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.raceStartBtn}</span>
          </button>
        )}

        {raceState === 'finished' && (
          <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              {isPredictionCorrect ? (
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {isPredictionCorrect ? t.duelCorrect : t.duelWrong}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Winner:{' '}
                  <strong>
                    {duel.winner === 'A'
                      ? `${duel.vehicleA.name} (${duel.speedA} m/s > ${duel.speedB} m/s)`
                      : duel.winner === 'B'
                      ? `${duel.vehicleB.name} (${duel.speedB} m/s > ${duel.speedA} m/s)`
                      : `Tie Race! Both at ${duel.speedA} m/s`}
                  </strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                resetMatch();
                setCurrentRoundIdx((prev) => (prev + 1) % DUEL_ROUNDS.length);
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              {t.nextDuel} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
