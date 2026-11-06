import React from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Globe, Wrench, Flag } from 'lucide-react';
import { sound } from '../utils/audio';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';

interface NavbarProps {
  currentView: 'hub' | 'race' | 'garage' | 'duel' | 'blitz' | 'sandbox';
  onNavigate: (view: 'hub' | 'race' | 'garage' | 'duel' | 'blitz' | 'sandbox') => void;
  onOpenAchievements: () => void;
  coins: number;
  xp: number;
  language: Language;
  onToggleLanguage: () => void;
  unlockedAchievementsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAchievements,
  coins,
  xp,
  language,
  onToggleLanguage,
  unlockedAchievementsCount
}) => {
  const t = TRANSLATIONS[language];
  const [isMuted, setIsMuted] = React.useState<boolean>(sound.getMuted());

  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('hub');
          }}
          className="text-lg font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center text-sm font-black shadow-xs">
            🏁
          </span>
          <span>{t.appTitle}</span>
        </button>

        {/* Zone 2: Navigation Links (Single-line text links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('hub');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'hub' ? 'text-rose-600 font-bold underline decoration-2 underline-offset-8' : 'hover:text-slate-900'
            }`}
          >
            {t.navGrandPrix}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('garage');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'garage' ? 'text-rose-600 font-bold underline decoration-2 underline-offset-8' : 'hover:text-slate-900'
            }`}
          >
            {t.navGarage}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('duel');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'duel' ? 'text-rose-600 font-bold underline decoration-2 underline-offset-8' : 'hover:text-slate-900'
            }`}
          >
            {t.navSpeedDuel}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('blitz');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'blitz' ? 'text-rose-600 font-bold underline decoration-2 underline-offset-8' : 'hover:text-slate-900'
            }`}
          >
            {t.navSpeedBlitz}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('sandbox');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'sandbox' ? 'text-rose-600 font-bold underline decoration-2 underline-offset-8' : 'hover:text-slate-900'
            }`}
          >
            {t.navSandbox}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleLanguage();
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Switch Language (English / Bahasa Indonesia)"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono">{language === 'en' ? 'EN 🇺🇸' : 'ID 🇮🇩'}</span>
          </button>

          {/* Coins Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold font-mono">
            <span>🪙</span>
            <span>{coins}</span>
          </div>

          {/* Trophy Room Badge */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAchievements();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5 transition-colors"
            title="Trophy Room"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline font-mono">{unlockedAchievementsCount}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
