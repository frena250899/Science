import React, { useState, useEffect, useRef } from 'react';
import { VehicleConfig, Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { DistanceTimeGraph } from './DistanceTimeGraph';
import { sound } from '../utils/audio';
import { Play, RotateCcw, FastForward, CheckCircle2, TrendingUp } from 'lucide-react';

interface SpeedSimulationTrackProps {
  vehicle: VehicleConfig;
  distance: number; // in meters (e.g. 40, 60, 100)
  targetTime: number; // in seconds (e.g. 4.0, 2.5, 6.0)
  onRunFinished: (elapsedTime: number) => void;
  isRunComplete: boolean;
  language?: Language;
}

export const SpeedSimulationTrack: React.FC<SpeedSimulationTrackProps> = ({
  vehicle,
  distance,
  targetTime,
  onRunFinished,
  isRunComplete,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language];
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(isRunComplete ? 1 : 0); // 0 to 1
  const [stopwatchTime, setStopwatchTime] = useState<number>(isRunComplete ? targetTime : 0);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [gateCrossed, setGateCrossed] = useState<boolean>(isRunComplete);
  const [showGraph, setShowGraph] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // When target changes or reset
  useEffect(() => {
    if (!isRunComplete) {
      setProgress(0);
      setStopwatchTime(0);
      setIsRunning(false);
      setGateCrossed(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      setProgress(1);
      setStopwatchTime(targetTime);
      setGateCrossed(true);
    }
  }, [distance, targetTime, isRunComplete]);

  const handleStartRun = () => {
    if (isRunning) return;

    sound.playClick();
    sound.playGateSensor();
    sound.playVehicleStart(vehicle.soundPitch);

    setIsRunning(true);
    setProgress(0);
    setGateCrossed(false);
    setStopwatchTime(0);

    const actualDurationMs = targetTime * 1000 * (isSlowMo ? 2 : 1);
    startTimeRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / actualDurationMs);
      const simulatedSeconds = currentProgress * targetTime;

      setProgress(currentProgress);
      setStopwatchTime(simulatedSeconds);

      if (currentProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        // Finish line crossed!
        setIsRunning(false);
        setProgress(1);
        setStopwatchTime(targetTime);
        setGateCrossed(true);
        sound.playFinishLine();
        onRunFinished(targetTime);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const handleReset = () => {
    sound.playClick();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRunning(false);
    setProgress(0);
    setStopwatchTime(0);
    setGateCrossed(false);
  };

  // Distance ticks calculation for track visualization
  const tickStep = distance <= 50 ? 10 : distance <= 100 ? 20 : 25;
  const numTicks = Math.floor(distance / tickStep);
  const tickMarks: number[] = [];
  for (let i = 0; i <= numTicks; i++) {
    tickMarks.push(i * tickStep);
  }
  if (!tickMarks.includes(distance)) {
    tickMarks.push(distance);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Track Header & Stopwatch Telemetry Bar */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
            {vehicle.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-white">{vehicle.name}</span>
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {vehicle.type}
              </span>
            </div>
            <p className="text-xs text-slate-400">Target Distance: <strong className="text-white font-mono">{distance} meters</strong></p>
          </div>
        </div>

        {/* Big Digital Stopwatch */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">DIGITAL STOPWATCH</span>
            <span className="text-xs font-mono text-cyan-400">
              {isRunning ? '● RECORDING' : gateCrossed ? '✓ GATE LOCKED' : 'READY TO START'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-cyan-300 tabular-nums bg-cyan-950/50 px-3 py-1 rounded-lg border border-cyan-800/40 min-w-[120px] text-center">
            {stopwatchTime.toFixed(2)}<span className="text-xs font-normal text-cyan-400 ml-1">s</span>
          </div>
        </div>
      </div>

      {/* Track Simulation Stage */}
      <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 p-4 sm:p-8 min-h-[260px] flex flex-col justify-end select-none overflow-hidden">
        {/* Background Environment Details */}
        <div className="absolute top-3 left-4 text-xs font-semibold text-slate-400 flex items-center gap-2">
          <span>TRACK SECTOR A-7</span>
          <span>·</span>
          <span>LASER SENSOR TIMING SYSTEM</span>
        </div>

        {/* Start Gate Emitter (0m) */}
        <div className="absolute left-6 sm:left-12 top-6 bottom-16 w-1 border-r-2 border-dashed border-emerald-500 z-10 flex flex-col justify-between items-center">
          <div className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap -translate-y-1">
            START 0m
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-60"></div>
          <div className="w-2.5 h-6 bg-emerald-700 rounded-t-sm shadow"></div>
        </div>

        {/* Finish Gate Receiver (Distance m) */}
        <div className="absolute right-6 sm:right-12 top-6 bottom-16 w-1 border-l-2 border-dashed border-cyan-500 z-10 flex flex-col justify-between items-center">
          <div className={`text-[11px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap -translate-y-1 transition-colors ${gateCrossed ? 'bg-cyan-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-cyan-300'}`}>
            FINISH {distance}m
          </div>
          <div className={`w-3 h-3 rounded-full transition-all ${gateCrossed ? 'bg-cyan-400 scale-125' : 'bg-cyan-700 opacity-70'}`}></div>
          <div className="w-2.5 h-6 bg-cyan-700 rounded-t-sm shadow"></div>
        </div>

        {/* Checkered Finish Line Decal */}
        <div className="absolute right-6 sm:right-12 bottom-12 w-3 h-16 bg-[repeating-linear-gradient(45deg,#000,#000_6px,#fff_6px,#fff_12px)] opacity-60 z-0"></div>

        {/* Moving Vehicle Layer */}
        <div className="relative w-full h-24 mb-2">
          {/* Track Lane */}
          <div className="absolute bottom-0 left-6 right-6 sm:left-12 sm:right-12 h-14 bg-slate-700 rounded-xl shadow-inner border border-slate-600 flex items-center">
            {/* Center Dashed Road Lines */}
            <div className="w-full h-0 border-b-2 border-dashed border-yellow-300/60 mx-4"></div>
          </div>

          {/* Vehicle Representation */}
          <div
            className="absolute bottom-3 transform -translate-x-1/2 transition-transform duration-75 z-20"
            style={{
              left: `calc(1.5rem + ${progress} * (100% - 3rem))`,
            }}
          >
            <div className="flex flex-col items-center">
              {/* Distance Label above vehicle */}
              <div className="bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mb-1 border border-slate-700 whitespace-nowrap shadow-sm">
                {(progress * distance).toFixed(1)} m
              </div>

              {/* Render dynamic vehicle SVG */}
              <div className="w-16 h-12 flex items-center justify-center drop-shadow-md">
                {vehicle.type === 'car' && (
                  <svg viewBox="0 0 100 60" className="w-16 h-10">
                    <path d="M5 40 Q 15 40 25 35 L 35 20 Q 45 15 70 15 L 85 28 Q 95 32 98 42 L 5 42 Z" fill="#EF4444" />
                    <path d="M38 22 L 68 22 L 66 32 L 32 32 Z" fill="#93C5FD" opacity="0.8" />
                    <circle cx="28" cy="44" r="8" fill="#1E293B" stroke="#94A3B8" strokeWidth="3" />
                    <circle cx="78" cy="44" r="8" fill="#1E293B" stroke="#94A3B8" strokeWidth="3" />
                    {isRunning && <circle cx="8" cy="40" r="4" fill="#F97316" className="animate-ping" />}
                  </svg>
                )}

                {vehicle.type === 'skateboard' && (
                  <svg viewBox="0 0 100 70" className="w-16 h-12">
                    {/* Skater Robot */}
                    <circle cx="48" cy="18" r="8" fill="#10B981" />
                    <path d="M48 26 L 46 45 L 36 54 M 46 45 L 58 54 M 35 34 L 58 32" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
                    {/* Deck */}
                    <path d="M15 56 Q 50 54 85 56" stroke="#059669" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="28" cy="62" r="4" fill="#F59E0B" />
                    <circle cx="72" cy="62" r="4" fill="#F59E0B" />
                  </svg>
                )}

                {vehicle.type === 'cheetah' && (
                  <svg viewBox="0 0 100 60" className="w-16 h-10">
                    {/* Cyber Cheetah Body */}
                    <ellipse cx="50" cy="30" rx="26" ry="12" fill="#F59E0B" />
                    <circle cx="76" cy="22" r="9" fill="#D97706" />
                    {/* Eyes */}
                    <circle cx="80" cy="20" r="2.5" fill="#38BDF8" />
                    {/* Legs with motion */}
                    <line x1="32" y1="38" x2={isRunning ? "22" : "28"} y2="52" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
                    <line x1="42" y1="38" x2={isRunning ? "52" : "44"} y2="52" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
                    <line x1="62" y1="38" x2={isRunning ? "52" : "58"} y2="52" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
                    <line x1="70" y1="38" x2={isRunning ? "82" : "74"} y2="52" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
                    {/* Tail */}
                    <path d="M24 28 Q 12 18 10 28" stroke="#F59E0B" strokeWidth="3" fill="none" />
                  </svg>
                )}

                {vehicle.type === 'drone' && (
                  <svg viewBox="0 0 100 60" className="w-16 h-10">
                    {/* Central Hull */}
                    <ellipse cx="50" cy="30" rx="14" ry="8" fill="#3B82F6" />
                    <circle cx="50" cy="30" r="4" fill="#60A5FA" />
                    {/* Arms */}
                    <line x1="24" y1="26" x2="76" y2="34" stroke="#1E293B" strokeWidth="3" />
                    <line x1="24" y1="34" x2="76" y2="26" stroke="#1E293B" strokeWidth="3" />
                    {/* Rotors */}
                    <ellipse cx="24" cy="26" rx={isRunning ? "12" : "8"} ry="2" fill="#94A3B8" />
                    <ellipse cx="76" cy="34" rx={isRunning ? "12" : "8"} ry="2" fill="#94A3B8" />
                    <ellipse cx="24" cy="34" rx={isRunning ? "12" : "8"} ry="2" fill="#94A3B8" />
                    <ellipse cx="76" cy="26" rx={isRunning ? "12" : "8"} ry="2" fill="#94A3B8" />
                    {/* Scanner Beam */}
                    <polygon points="44,38 56,38 68,54 32,54" fill="#38BDF8" opacity="0.3" />
                  </svg>
                )}

                {vehicle.type === 'rocket' && (
                  <svg viewBox="0 0 100 60" className="w-16 h-10">
                    <path d="M18 30 L 72 20 Q 88 30 72 40 L 18 30 Z" fill="#8B5CF6" />
                    <polygon points="18,18 36,22 28,30" fill="#6D28D9" />
                    <polygon points="18,42 36,38 28,30" fill="#6D28D9" />
                    <circle cx="60" cy="30" r="4" fill="#C4B5FD" />
                    {/* Exhaust Thruster */}
                    <polygon points="18,25 18,35 6,30" fill="#4C1D95" />
                    {isRunning && (
                      <polygon points="8,26 8,34 -8,30" fill="#F97316" className="animate-pulse" />
                    )}
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Distance Tick Marks Bar */}
        <div className="relative w-full h-8 px-6 sm:px-12 flex justify-between items-center text-xs font-mono font-medium text-slate-500 border-t border-slate-300 pt-2">
          {tickMarks.map((tick) => {
            const pct = (tick / distance) * 100;
            return (
              <div
                key={tick}
                className="absolute flex flex-col items-center transform -translate-x-1/2"
                style={{ left: `calc(1.5rem + ${pct / 100} * (100% - 3rem))` }}
              >
                <div className={`h-2.5 w-0.5 ${tick === 0 || tick === distance ? 'bg-slate-900 h-3.5 w-1' : 'bg-slate-400'}`}></div>
                <span className={`text-[11px] mt-0.5 ${tick === distance ? 'font-bold text-cyan-700' : ''}`}>
                  {tick}m
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Action Strip */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isRunComplete ? (
            <button
              onClick={handleStartRun}
              disabled={isRunning}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
                isRunning
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              {isRunning ? 'Run In Progress...' : 'Start Run'}
            </button>
          ) : (
            <button
              onClick={handleStartRun}
              className="px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white transition-all shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay Run
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={isRunning || progress === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Graph Toggle, Slow Motion & Status Indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowGraph(!showGraph);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showGraph
                ? 'bg-blue-600 text-white border-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.graphToggle}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsSlowMo(!isSlowMo);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isSlowMo
                ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isSlowMo ? t.slowMoOn : t.slowMoOff}</span>
          </button>

          {gateCrossed && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {t.sensorRecorded}
            </span>
          )}
        </div>
      </div>

      {/* Collapsible Distance-Time Graph */}
      {showGraph && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 animate-fadeIn">
          <DistanceTimeGraph
            distance={distance}
            time={targetTime}
            currentProgress={progress}
            language={language}
          />
        </div>
      )}
    </div>
  );
};
