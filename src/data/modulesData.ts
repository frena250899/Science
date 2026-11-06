import { CircuitTrack, VehicleConfig } from '../types/game';

/**
 * ============================================================================
 * STEM GRAND PRIX RACING FLEET
 * ============================================================================
 * Upgradable racing vehicles with distinct acceleration, top speed, and nitro power!
 */
export const RACING_VEHICLES: VehicleConfig[] = [
  {
    id: 'racecar',
    name: 'Formula Apex GT',
    type: 'car',
    emoji: '🏎️',
    color: '#EF4444',
    description: 'Precision aerodynamic Grand Prix formula race car with responsive handling.',
    soundPitch: 1.0,
    topSpeed: 25,
    acceleration: 20,
    nitroPower: 30,
    price: 0,
    unlocked: true
  },
  {
    id: 'cheetah',
    name: 'Cyber Cheetah GT',
    type: 'cheetah',
    emoji: '🐆',
    color: '#F59E0B',
    description: 'Bionic quadruped sprinter with explosive launch acceleration off the grid.',
    soundPitch: 1.3,
    topSpeed: 28,
    acceleration: 35,
    nitroPower: 25,
    price: 300,
    unlocked: true
  },
  {
    id: 'drone',
    name: 'Sky Cruiser Jet',
    type: 'drone',
    emoji: '🛸',
    color: '#3B82F6',
    description: 'Anti-gravity maglev racer hovering over track friction for lightning fast top speed.',
    soundPitch: 1.5,
    topSpeed: 32,
    acceleration: 24,
    nitroPower: 35,
    price: 600,
    unlocked: false
  },
  {
    id: 'skater',
    name: 'Turbo Cruiser X',
    type: 'skateboard',
    emoji: '🛹',
    color: '#10B981',
    description: 'Hyper-agile electric longboard designed by robot Alex for nimble cornering.',
    soundPitch: 1.2,
    topSpeed: 24,
    acceleration: 30,
    nitroPower: 28,
    price: 200,
    unlocked: false
  },
  {
    id: 'rocket',
    name: 'Plasma Rocket Mach-1',
    type: 'rocket',
    emoji: '🚀',
    color: '#8B5CF6',
    description: 'Experimental jet-afterburner monster engineered to break the sound barrier!',
    soundPitch: 0.8,
    topSpeed: 42,
    acceleration: 28,
    nitroPower: 50,
    price: 1000,
    unlocked: false
  }
];

export const TEST_VEHICLES: Record<string, VehicleConfig> = RACING_VEHICLES.reduce((acc, v) => {
  acc[v.id] = v;
  return acc;
}, {} as Record<string, VehicleConfig>);

/**
 * ============================================================================
 * GRAND PRIX CIRCUITS (TOURNAMENT TRACKS)
 * ============================================================================
 * 5 Championship Circuits with progressive challenge, rival racers, and rewards!
 */
export const CHAMPIONSHIP_CIRCUITS: CircuitTrack[] = [
  {
    id: 'circuit-1',
    name: 'Rookie Oval Speedway',
    nameId: 'Sirkuit Oval Pemula',
    trackTheme: 'city',
    distance: 60,
    time: 4.0,
    correctSpeed: 15, // 60m / 4s = 15 m/s
    rivals: [
      { name: 'Speedy Sam', carName: 'Blue Streak', emoji: '🚗', color: '#3B82F6', speed: 12 },
      { name: 'Turbo Tina', carName: 'Yellow Dart', emoji: '🏎️', color: '#EAB308', speed: 14 }
    ],
    difficulty: 'rookie',
    rewardCoins: 150,
    rewardXP: 100
  },
  {
    id: 'circuit-2',
    name: 'Neon Metropolis Ring',
    nameId: 'Lintasan Kota Neon',
    trackTheme: 'neon',
    distance: 100,
    time: 5.0,
    correctSpeed: 20, // 100m / 5s = 20 m/s
    rivals: [
      { name: 'Drift King Leo', carName: 'Shadow Fury', emoji: '🏎️', color: '#6366F1', speed: 18 },
      { name: 'Blaze Nova', carName: 'Firebird', emoji: '🚗', color: '#F97316', speed: 19 }
    ],
    difficulty: 'pro',
    rewardCoins: 250,
    rewardXP: 150
  },
  {
    id: 'circuit-3',
    name: 'Canyon Dust Raceway',
    nameId: 'Sirkuit Lembah Tebing',
    trackTheme: 'desert',
    distance: 75,
    time: 3.0,
    correctSpeed: 25, // 75m / 3s = 25 m/s
    rivals: [
      { name: 'Viper Cruz', carName: 'Desert Storm', emoji: '🏎️', color: '#84CC16', speed: 22 },
      { name: 'Max Overdrive', carName: 'Canyon Beast', emoji: '🚙', color: '#EC4899', speed: 24 }
    ],
    difficulty: 'master',
    rewardCoins: 350,
    rewardXP: 200
  },
  {
    id: 'circuit-4',
    name: 'Cyber Highway 2099',
    nameId: 'Jalan Layang Siber',
    trackTheme: 'cyber',
    distance: 120,
    time: 4.0,
    correctSpeed: 30, // 120m / 4s = 30 m/s
    rivals: [
      { name: 'Android Zero', carName: 'Quantum Glider', emoji: '🛸', color: '#06B6D4', speed: 28 },
      { name: 'Phantom Ray', carName: 'Apex Hunter', emoji: '🏎️', color: '#A855F7', speed: 29 }
    ],
    difficulty: 'master',
    rewardCoins: 500,
    rewardXP: 300
  },
  {
    id: 'circuit-5',
    name: 'Hyper Speedway Championship',
    nameId: 'Grand Final Kejuaraan Supersonik',
    trackTheme: 'space',
    distance: 140,
    time: 3.5,
    correctSpeed: 40, // 140m / 3.5s = 40 m/s
    rivals: [
      { name: 'Titan Rex', carName: 'Supernova Mach-3', emoji: '🚀', color: '#E11D48', speed: 37 },
      { name: 'Champion Luna', carName: 'Eclipse Hyper', emoji: '🏎️', color: '#10B981', speed: 38 }
    ],
    difficulty: 'champion',
    rewardCoins: 800,
    rewardXP: 500
  }
];
