import React from 'react';
import { Language, Achievement } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';
import { sound } from '../utils/audio';
import { Trophy, X, CheckCircle, Lock } from 'lucide-react';

interface AchievementsModalProps {
  onClose: () => void;
  language: Language;
  unlockedIds: string[];
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_solve',
    title: 'First Strike',
    titleId: 'Pukulan Pertama',
    description: 'Accurately solve your first speed calculation.',
    descriptionId: 'Selesaikan perhitungan kelajuan pertamamu dengan tepat.',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    titleId: 'Membara',
    description: 'Achieve a 3-question correct streak combo.',
    descriptionId: 'Raih kombo 3 kali berturut-turut menjawab benar.',
    icon: '🔥',
    unlocked: false
  },
  {
    id: 'supersonic',
    title: 'Supersonic Ace',
    titleId: 'Ahli Supersonik',
    description: 'Solve a high-speed vehicle trial exceeding 25 m/s.',
    descriptionId: 'Hitung kelajuan uji coba kendaraan berkecepatan di atas 25 m/s.',
    icon: '🚀',
    unlocked: false
  },
  {
    id: 'slow_mo',
    title: 'Kinematics Observer',
    titleId: 'Pengamat Kinematika',
    description: 'Use the Slow-Motion (0.5x) tool on the test track.',
    descriptionId: 'Gunakan fitur Gerak Lambat (0.5x) di lintasan uji coba.',
    icon: '⏱️',
    unlocked: false
  },
  {
    id: 'duel_winner',
    title: 'Duel Champion',
    titleId: 'Juara Duel Balap',
    description: 'Correctly predict the winner of a Head-to-Head race.',
    descriptionId: 'Tebak pemenang duel balap head-to-head dengan benar.',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'blitz_master',
    title: 'Blitz Runner',
    titleId: 'Pelari Kilat',
    description: 'Complete a 60-second Speed Blitz challenge.',
    descriptionId: 'Selesaikan tantangan kuis kilat 60 detik.',
    icon: '⏳',
    unlocked: false
  },
  {
    id: 'bilingual',
    title: 'Bilingual Scholar',
    titleId: 'Ilmuwan Dwibahasa',
    description: 'Switch between English and Indonesian language modes.',
    descriptionId: 'Ganti mode bahasa antara Bahasa Inggris dan Indonesia.',
    icon: '🌐',
    unlocked: false
  },
  {
    id: 'master_cert',
    title: 'Master of Motion',
    titleId: 'Master Fisika Gerak',
    description: 'Complete all 5 rounds and earn your Official Certificate.',
    descriptionId: 'Selesaikan 5 ronde dan dapatkan Sertifikat Resmi Prestasi.',
    icon: '🏆',
    unlocked: false
  }
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  onClose,
  language,
  unlockedIds
}) => {
  const t = TRANSLATIONS[language];
  const unlockedCount = unlockedIds.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base tracking-wide">
              {language === 'id' ? 'RUANG PIALA & PENCAPAIAN' : 'TROPHY ROOM & ACHIEVEMENTS'}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 block">
              {language === 'id' ? 'Piala Terkumpul' : 'Trophies Collected'}
            </span>
            <span className="text-xs text-slate-500">
              {unlockedCount} {language === 'id' ? 'dari' : 'of'} {ACHIEVEMENTS_LIST.length} {language === 'id' ? 'lencana terbuka' : 'badges unlocked'}
            </span>
          </div>

          <div className="w-36 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / ACHIEVEMENTS_LIST.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-amber-200/60 shadow-xs' : 'bg-slate-200'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {language === 'id' ? ach.titleId : ach.title}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                    {language === 'id' ? ach.descriptionId : ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            {language === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
