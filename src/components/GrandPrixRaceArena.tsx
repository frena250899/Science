import React, { useState, useEffect, useRef } from 'react';
import { CircuitTrack, VehicleConfig, VehicleUpgrades, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { sound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import {
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Trophy,
  RotateCcw,
  Eraser,
  Trash2,
  X,
  Gauge
} from 'lucide-react';

interface GrandPrixRaceArenaProps {
  circuit: CircuitTrack;
  playerVehicle: VehicleConfig;
  playerColor: string;
  upgrades: VehicleUpgrades;
  language: Language;
  onRaceFinished: (rank: number, coins: number, xp: number) => void;
  onNextCircuit: () => void;
  onReturnToHub: () => void;
}

export const GrandPrixRaceArena: React.FC<GrandPrixRaceArenaProps> = ({
  circuit,
  playerVehicle,
  playerColor,
  upgrades,
  language,
  onRaceFinished,
  onNextCircuit,
  onReturnToHub
}) => {
  const t = TRANSLATIONS[language];

  // Race Phases: 'ready' -> 'lights' -> 'racing' -> 'checkpoint' -> 'nitro_sprint' -> 'finished'
  const [racePhase, setRacePhase] = useState<'ready' | 'lights' | 'racing' | 'finished'>('ready');
  const [lightCount, setLightCount] = useState<number>(0); // 0 = off, 1,2,3 = red, 4 = green
  const [playerInput, setPlayerInput] = useState<string>('');
  const [isNitroActive, setIsNitroActive] = useState<boolean>(false);
  const [checkpointSolved, setCheckpointSolved] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');

  // Positions on track (0 to 1)
  const [posPlayer, setPosPlayer] = useState<number>(0);
  const [posRival1, setPosRival1] = useState<number>(0);
  const [posRival2, setPosRival2] = useState<number>(0);

  // Final Rank & Podium
  const [finalRank, setFinalRank] = useState<number>(1);
  const [showPodium, setShowPodium] = useState<boolean>(false);

  // Scratchpad state
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Reset when circuit changes
  useEffect(() => {
    setRacePhase('ready');
    setLightCount(0);
    setPlayerInput('');
    setIsNitroActive(false);
    setCheckpointSolved(false);
    setFeedbackError('');
    setPosPlayer(0);
    setPosRival1(0);
    setPosRival2(0);
    setShowPodium(false);
  }, [circuit]);

  // Traffic Lights sequence: 3 Red lights -> Green GO!
  const handleStartRace = () => {
    sound.playClick();
    setRacePhase('lights');
    setLightCount(1);
    sound.playCountdownBeep(false);

    let count = 1;
    const interval = setInterval(() => {
      count += 1;
      if (count <= 3) {
        setLightCount(count);
        sound.playCountdownBeep(false);
      } else if (count === 4) {
        setLightCount(4); // GREEN GO!
        sound.playCountdownBeep(true);
      } else {
        clearInterval(interval);
        startRaceSimulation();
      }
    }, 700);
  };

  const startRaceSimulation = () => {
    setRacePhase('racing');
    sound.playEngineThrottle(playerVehicle.soundPitch);

    startTimeRef.current = performance.now();
    // Base race duration in milliseconds
    const baseDuration = circuit.time * 1000;

    const step = (now: number) => {
      const elapsed = now - startTimeRef.current;

      // Calculate speed factors
      // Engine upgrade adds +10% base speed per level
      const engineBonus = (upgrades.engineLevel - 1) * 0.05;
      const nitroMultiplier = isNitroActive ? 1.45 + (upgrades.nitroLevel - 1) * 0.08 : 1.0;

      // Base progression rates
      const playerSpeedRate = (circuit.correctSpeed * (1 + engineBonus) * nitroMultiplier) / circuit.distance;
      const rival1SpeedRate = circuit.rivals[0].speed / circuit.distance;
      const rival2SpeedRate = circuit.rivals[1].speed / circuit.distance;

      const pPos = Math.min(1, (elapsed / 1000) * playerSpeedRate);
      const r1Pos = Math.min(1, (elapsed / 1000) * rival1SpeedRate);
      const r2Pos = Math.min(1, (elapsed / 1000) * rival2SpeedRate);

      setPosPlayer(pPos);
      setPosRival1(r1Pos);
      setPosRival2(r2Pos);

      // Check if race concluded
      if (pPos >= 1 || (r1Pos >= 1 && r2Pos >= 1)) {
        finishRace(pPos, r1Pos, r2Pos);
      } else {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  // Trigger Nitro Boost when student enters correct speed calculation
  const handleTriggerNitro = () => {
    if (!playerInput.trim() || checkpointSolved) return;

    sound.playClick();
    const parsed = parseFloat(playerInput.trim());
    const isCorrect = Math.abs(parsed - circuit.correctSpeed) < 0.05;

    if (isCorrect) {
      sound.playCorrectFanfare();
      sound.playNitroBoost();
      setIsNitroActive(true);
      setCheckpointSolved(true);
      setFeedbackError('');
    } else {
      sound.playTryAgain();
      setFeedbackError(
        language === 'id'
          ? `Hitung kembali: ${circuit.distance}m ÷ ${circuit.time}s = ?`
          : `Recalculate: ${circuit.distance}m ÷ ${circuit.time}s = ?`
      );
    }
  };

  const finishRace = (finalP: number, finalR1: number, finalR2: number) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setRacePhase('finished');
    sound.playFinishLine();

    // Determine Rank
    let rank = 1;
    if (finalP < finalR1 && finalP < finalR2) {
      rank = 3;
    } else if (finalP < finalR1 || finalP < finalR2) {
      rank = 2;
    }

    setFinalRank(rank);
    setShowPodium(true);

    const coins = rank === 1 ? circuit.rewardCoins : Math.round(circuit.rewardCoins * 0.6);
    const xp = rank === 1 ? circuit.rewardXP : Math.round(circuit.rewardXP * 0.6);

    if (rank === 1) {
      sound.playPodiumTheme();
      fireConfetti(3500);
    }

    onRaceFinished(rank, coins, xp);
  };

  // Numpad key input
  const handleNumInput = (char: string) => {
    sound.playClick();
    if (checkpointSolved) return;
    if (char === 'clear') {
      setPlayerInput('');
    } else if (char === 'backspace') {
      setPlayerInput(prev => prev.slice(0, -1));
    } else if (char === '.') {
      if (!playerInput.includes('.')) {
        setPlayerInput(prev => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      if (playerInput.length < 6) {
        setPlayerInput(prev => prev + char);
      }
    }
  };

  // Scratchpad drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = tool === 'eraser' ? 18 : 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : '#2563EB';
      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearScratchpad = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Track Environment theme styles
  const getThemeBg = () => {
    switch (circuit.trackTheme) {
      case 'neon':
        return 'from-slate-950 via-purple-950 to-slate-900 border-purple-500/40';
      case 'desert':
        return 'from-amber-950 via-stone-900 to-amber-900 border-amber-600/40';
      case 'cyber':
        return 'from-cyan-950 via-slate-950 to-blue-950 border-cyan-500/40';
      case 'space':
        return 'from-slate-950 via-indigo-950 to-black border-indigo-500/40';
      default:
        return 'from-slate-900 via-slate-800 to-slate-900 border-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Top Race Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
              onReturnToHub();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            ← {t.navGrandPrix}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                CIRCUIT RACE · {circuit.difficulty.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">· {circuit.distance}m Distance</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              {language === 'id' ? circuit.nameId : circuit.name}
            </h1>
          </div>
        </div>

        {/* Traffic Start Lights Cluster */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-4 h-4 rounded-full border border-slate-700 transition-all ${
                  lightCount >= num && lightCount < 4
                    ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                    : 'bg-rose-950/60'
                }`}
              />
            ))}
            <div
              className={`w-4 h-4 rounded-full border border-slate-700 transition-all ${
                lightCount === 4 ? 'bg-emerald-400 shadow-[0_0_14px_#34d399] animate-pulse' : 'bg-emerald-950/60'
              }`}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {lightCount === 0 ? 'START LIGHTS' : lightCount < 4 ? 'GET SET' : 'GREEN GO!'}
          </span>
        </div>
      </div>

      {/* 3-LANE REAL-TIME RACING TRACK ARENA */}
      <div className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b ${getThemeBg()} border shadow-xl select-none overflow-hidden`}>
        {/* Track Overhead Distance Markings */}
        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 mb-3 px-6 sm:px-12">
          <span>0m START GATE</span>
          <span className="text-amber-400">⚡ CHECKPOINT RADAR: {circuit.distance}m in {circuit.time}s</span>
          <span className="text-cyan-400">FINISH LINE ({circuit.distance}m) 🏁</span>
        </div>

        {/* Lane 1: Player Vehicle */}
        <div className="relative mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1 px-1">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              {t.lanePlayer}: <strong className="text-emerald-300">{playerVehicle.name}</strong>
              {isNitroActive && <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">🔥 NITRO ACTIVE</span>}
            </span>
            <span className="font-mono text-slate-400">
              {(posPlayer * circuit.distance).toFixed(1)}m / {circuit.distance}m
            </span>
          </div>

          <div className="h-16 bg-slate-800/90 rounded-2xl relative flex items-center px-6 sm:px-12 border-2 border-slate-700 shadow-inner">
            {/* Center Dashed Asphalt Line */}
            <div className="w-full border-b-2 border-dashed border-yellow-400/50"></div>

            {/* Checkered Finish Gate */}
            <div className="absolute right-6 sm:right-12 top-1 bottom-1 w-3 bg-[repeating-linear-gradient(45deg,#000,#000_5px,#fff_5px,#fff_10px)] opacity-80 z-10"></div>

            {/* Player Car Representation */}
            <div
              className="absolute transform -translate-x-1/2 transition-transform duration-75 z-20 flex items-center"
              style={{ left: `calc(1.5rem + ${posPlayer} * (100% - 3rem))` }}
            >
              {/* Nitro Exhaust Flame */}
              {isNitroActive && (
                <div className="text-2xl mr-1 transform rotate-180 animate-ping">
                  🔥
                </div>
              )}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/40"
                style={{ backgroundColor: playerColor }}
              >
                {playerVehicle.emoji}
              </div>
            </div>
          </div>
        </div>

        {/* Lane 2: Rival 1 */}
        <div className="relative mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1 px-1">
            <span>
              {circuit.rivals[0].name} ({circuit.rivals[0].carName})
            </span>
            <span className="font-mono text-slate-400">
              {(posRival1 * circuit.distance).toFixed(1)}m / {circuit.distance}m
            </span>
          </div>

          <div className="h-14 bg-slate-900/90 rounded-2xl relative flex items-center px-6 sm:px-12 border border-slate-800">
            <div className="w-full border-b border-dashed border-slate-700"></div>
            <div className="absolute right-6 sm:right-12 top-1 bottom-1 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)] opacity-50 z-10"></div>

            <div
              className="absolute transform -translate-x-1/2 transition-transform duration-75 text-2xl z-10"
              style={{ left: `calc(1.5rem + ${posRival1} * (100% - 3rem))` }}
            >
              {circuit.rivals[0].emoji}
            </div>
          </div>
        </div>

        {/* Lane 3: Rival 2 */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1 px-1">
            <span>
              {circuit.rivals[1].name} ({circuit.rivals[1].carName})
            </span>
            <span className="font-mono text-slate-400">
              {(posRival2 * circuit.distance).toFixed(1)}m / {circuit.distance}m
            </span>
          </div>

          <div className="h-14 bg-slate-900/90 rounded-2xl relative flex items-center px-6 sm:px-12 border border-slate-800">
            <div className="w-full border-b border-dashed border-slate-700"></div>
            <div className="absolute right-6 sm:right-12 top-1 bottom-1 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)] opacity-50 z-10"></div>

            <div
              className="absolute transform -translate-x-1/2 transition-transform duration-75 text-2xl z-10"
              style={{ left: `calc(1.5rem + ${posRival2} * (100% - 3rem))` }}
            >
              {circuit.rivals[1].emoji}
            </div>
          </div>
        </div>
      </div>

      {/* RACE CONTROLS & CHECKPOINT SPEED CALCULATION DECK */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
        {racePhase === 'ready' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl">
                🏁
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {t.readyPrompt}
                </h3>
                <p className="text-xs text-slate-500">
                  Hit the launch button to ignite start lights and launch onto the track!
                </p>
              </div>
            </div>

            <button
              onClick={handleStartRace}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>{t.startEngineBtn}</span>
            </button>
          </div>
        )}

        {/* Active Race & Checkpoint Math Calculation */}
        {(racePhase === 'racing' || racePhase === 'lights') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Telemetry & Nitro Input */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-amber-600" />
                  {t.checkpointReached}
                </span>

                <button
                  onClick={() => {
                    sound.playClick();
                    setShowScratchpad(!showScratchpad);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    showScratchpad ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{t.scratchpadBtn}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {t.checkpointDesc}
              </p>

              {/* Measured Telemetry Strip */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.distanceLabel}</span>
                    <span className="text-xl font-mono font-bold text-blue-700 tabular-nums">
                      {circuit.distance} <span className="text-xs text-slate-500 font-normal">{t.meters}</span>
                    </span>
                  </div>
                  <span className="font-mono font-bold text-blue-600 text-sm">s</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.timeLabel}</span>
                    <span className="text-xl font-mono font-bold text-emerald-700 tabular-nums">
                      {circuit.time} <span className="text-xs text-slate-500 font-normal">{t.seconds}</span>
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 text-sm">t</span>
                </div>
              </div>

              {/* Speed Input & Big Nitro Trigger */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  {t.speedInputPrompt} <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-bold">{circuit.distance} ÷ {circuit.time}</code>
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={playerInput}
                      onChange={(e) => setPlayerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTriggerNitro();
                      }}
                      disabled={checkpointSolved}
                      className="w-full text-2xl font-mono font-bold px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none tabular-nums disabled:bg-emerald-50 disabled:border-emerald-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                      {t.metersPerSec}
                    </span>
                  </div>

                  <button
                    onClick={handleTriggerNitro}
                    disabled={!playerInput.trim() || checkpointSolved}
                    className={`px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-md flex items-center gap-2 active:scale-95 ${
                      checkpointSolved
                        ? 'bg-emerald-600 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white'
                    }`}
                  >
                    <Flame className="w-5 h-5 fill-current" />
                    <span>{checkpointSolved ? 'BOOST ACTIVE' : t.nitroBtn}</span>
                  </button>
                </div>

                {isNitroActive && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2 animate-bounce">
                    <Flame className="w-4 h-4 text-amber-600 fill-current" />
                    <span>{t.nitroReady}</span>
                  </div>
                )}

                {feedbackError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{feedbackError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Touch Numpad */}
            <div className="lg:col-span-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block mb-2">
                TOUCH NUMPAD
              </span>
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumInput(key)}
                    className={`py-2.5 rounded-xl font-mono font-bold text-base transition-all active:scale-95 border ${
                      key === 'backspace'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 text-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100 shadow-xs'
                    }`}
                  >
                    {key === 'backspace' ? '⌫ DEL' : key}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleNumInput('clear')}
                className="w-full mt-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Scratchpad Drawer */}
        {showScratchpad && (
          <div className="p-4 bg-slate-50 border border-blue-200 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase">
                  Pit-Stop Scratchpad (Do Your Long Division Here!)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTool('pen')}
                  className={`px-2 py-1 rounded text-xs font-bold ${tool === 'pen' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                >
                  Pen
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-2 py-1 rounded text-xs font-bold ${tool === 'eraser' ? 'bg-slate-300 text-slate-900' : 'text-slate-600'}`}
                >
                  <Eraser className="w-3.5 h-3.5 inline" /> Eraser
                </button>
                <button
                  onClick={clearScratchpad}
                  className="px-2 py-1 text-xs text-rose-600 border border-rose-200 rounded hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5 inline" /> Clear
                </button>
                <button
                  onClick={() => setShowScratchpad(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full bg-white rounded-xl border border-slate-300 overflow-hidden touch-none shadow-inner">
              <canvas
                ref={canvasRef}
                width={700}
                height={200}
                className="w-full h-36 cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>
        )}
      </div>

      {/* PODIUM CELEBRATION MODAL */}
      {showPodium && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 text-center flex flex-col items-center gap-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-4xl shadow-md">
              {finalRank === 1 ? '🏆' : finalRank === 2 ? '🥈' : '🥉'}
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                {t.raceFinished}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {finalRank === 1 ? t.firstPlace : finalRank === 2 ? t.secondPlace : t.thirdPlace}
              </h2>
            </div>

            {/* Reward Summary */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">{t.coinsEarned}</span>
                <span className="text-2xl font-mono font-bold text-amber-900">
                  +{finalRank === 1 ? circuit.rewardCoins : Math.round(circuit.rewardCoins * 0.6)} 🪙
                </span>
              </div>

              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">{t.xpEarned}</span>
                <span className="text-2xl font-mono font-bold text-blue-900">
                  +{finalRank === 1 ? circuit.rewardXP : Math.round(circuit.rewardXP * 0.6)} XP
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              {finalRank === 1 ? (
                <button
                  onClick={() => {
                    sound.playClick();
                    onNextCircuit();
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
                >
                  {t.nextCircuitBtn} →
                </button>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    setRacePhase('ready');
                    setShowPodium(false);
                    setPosPlayer(0);
                    setPosRival1(0);
                    setPosRival2(0);
                    setPlayerInput('');
                    setIsNitroActive(false);
                  }}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.retryCircuitBtn}</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playClick();
                  onReturnToHub();
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                {t.returnGarageBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
