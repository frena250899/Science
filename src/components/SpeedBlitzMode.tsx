import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { sound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import {
  Timer,
  Zap,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface SpeedBlitzModeProps {
  onBackToHub: () => void;
  language: Language;
  onEarnXP: (xp: number) => void;
}

interface BlitzQuestion {
  distance: number;
  time: number;
  correctSpeed: number;
  options: number[];
}

export const SpeedBlitzMode: React.FC<SpeedBlitzModeProps> = ({
  onBackToHub,
  language,
  onEarnXP
}) => {
  const t = TRANSLATIONS[language];
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [questionsSolved, setQuestionsSolved] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('stem_motion_blitz_high_score') || '0', 10);
  });

  const [currentQuestion, setCurrentQuestion] = useState<BlitzQuestion | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a friendly middle-school division question
  const generateQuestion = (): BlitzQuestion => {
    // Pick nice speed from 5 to 35
    const speeds = [5, 8, 10, 12, 15, 18, 20, 24, 25, 30];
    const times = [2, 3, 4, 5, 6, 8, 10];

    const correctSpeed = speeds[Math.floor(Math.random() * speeds.length)];
    const time = times[Math.floor(Math.random() * times.length)];
    const distance = correctSpeed * time;

    // Generate 3 plausible distractor options
    const optionsSet = new Set<number>([correctSpeed]);
    while (optionsSet.size < 4) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 2 : -2);
      const val = Math.max(2, correctSpeed + offset);
      optionsSet.add(val);
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return { distance, time, correctSpeed, options };
  };

  const startBlitz = () => {
    sound.playClick();
    sound.playVehicleStart(1.5);
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setQuestionsSolved(0);
    setCurrentQuestion(generateQuestion());
  };

  // Timer loop
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          if (prev <= 6) {
            sound.playCountdownBeep(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleGameOver = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    sound.playFinishLine();

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('stem_motion_blitz_high_score', score.toString());
      fireConfetti(3000);
      sound.playVictoryTheme();
    }
    onEarnXP(score);
  };

  const handleAnswerOption = (chosen: number) => {
    if (!currentQuestion || !isPlaying) return;

    if (chosen === currentQuestion.correctSpeed) {
      sound.playCorrectFanfare();
      const nextStreak = streak + 1;
      const points = 50 + nextStreak * 15;

      setScore((prev) => prev + points);
      setStreak(nextStreak);
      setQuestionsSolved((prev) => prev + 1);
      // Bonus +2 seconds
      setTimeLeft((prev) => Math.min(75, prev + 2));
      setCurrentQuestion(generateQuestion());
    } else {
      sound.playTryAgain();
      setStreak(0);
      // Small 2 second penalty
      setTimeLeft((prev) => Math.max(0, prev - 2));
      setCurrentQuestion(generateQuestion());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              if (timerRef.current) clearInterval(timerRef.current);
              onBackToHub();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                RAPID SPEED BLITZ
              </span>
              <span className="text-xs text-slate-400">· 60s Challenge</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t.blitzTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-amber-900">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>High Score: <strong className="font-mono">{highScore} XP</strong></span>
          </div>
        </div>
      </div>

      {/* Main Blitz Arena */}
      {!isPlaying && !isGameOver && (
        <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-5 shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
            ⚡
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            60-Second Speed Blitz Challenge
          </h2>
          <p className="text-sm sm:text-base text-orange-100 max-w-lg leading-relaxed">
            {t.blitzSubtitle}
          </p>

          <button
            onClick={startBlitz}
            className="mt-4 px-8 py-4 bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-lg rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-6 h-6 fill-current" />
            <span>{t.startBlitz}</span>
          </button>
        </div>
      )}

      {/* Active Game State */}
      {isPlaying && currentQuestion && (
        <div className="flex flex-col gap-5">
          {/* Status Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.timeLeft}</span>
                <span className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                  {timeLeft}s
                </span>
              </div>
              <Timer className="w-6 h-6 text-slate-400" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.currentScore}</span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-600 tabular-nums">
                  {score}
                </span>
              </div>
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.streak}</span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-600 tabular-nums flex items-center gap-1">
                  {streak} {streak > 1 && <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </span>
              </div>
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${timeLeft <= 10 ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-md text-center flex flex-col items-center gap-6">
            <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              SOLVE SPEED: v = d ÷ t
            </div>

            <div className="flex items-center justify-center gap-4 text-3xl sm:text-5xl font-mono font-bold text-slate-900">
              <span className="bg-blue-50 text-blue-800 px-4 py-2 rounded-2xl border border-blue-200">
                {currentQuestion.distance}m
              </span>
              <span className="text-slate-400">÷</span>
              <span className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl border border-emerald-200">
                {currentQuestion.time}s
              </span>
              <span className="text-slate-400">=</span>
              <span className="text-amber-500 font-bold">? m/s</span>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerOption(opt)}
                  className="py-4 sm:py-5 px-6 rounded-2xl font-mono font-bold text-2xl text-slate-800 bg-slate-100 hover:bg-blue-600 hover:text-white border-2 border-slate-200 hover:border-blue-600 shadow-sm transition-all active:scale-95"
                >
                  {opt} <span className="text-sm font-normal">m/s</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center gap-5 shadow-lg animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl">
            🏆
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {t.blitzGameOver}
          </h2>
          <p className="text-sm text-slate-600">
            You calculated under pressure and mastered velocity unit rates!
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm my-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">{t.totalScore}</span>
              <span className="text-3xl font-mono font-bold text-amber-600 tabular-nums">{score} XP</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">{t.questionsSolved}</span>
              <span className="text-3xl font-mono font-bold text-blue-600 tabular-nums">{questionsSolved}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startBlitz}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.playAgain}</span>
            </button>
            <button
              onClick={onBackToHub}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
            >
              <span>{t.returnHub}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
