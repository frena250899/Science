export type Language = 'en' | 'id';

export interface VehicleConfig {
  id: string;
  name: string;
  type: 'car' | 'skateboard' | 'cheetah' | 'drone' | 'rocket';
  emoji: string;
  color: string;
  description: string;
  soundPitch: number;
  topSpeed: number; // base speed stat
  acceleration: number; // base accel stat
  nitroPower: number; // boost stat
  price: number;
  unlocked: boolean;
}

export interface VehicleUpgrades {
  engineLevel: number; // 1 to 5
  nitroLevel: number; // 1 to 5
  aeroLevel: number; // 1 to 5
}

export interface CircuitTrack {
  id: string;
  name: string;
  nameId: string;
  trackTheme: 'city' | 'desert' | 'neon' | 'cyber' | 'space';
  distance: number; // total distance in meters
  time: number; // target time in seconds
  correctSpeed: number; // m/s
  rivals: {
    name: string;
    carName: string;
    emoji: string;
    color: string;
    speed: number; // rival speed in m/s
  }[];
  difficulty: 'rookie' | 'pro' | 'master' | 'champion';
  rewardCoins: number;
  rewardXP: number;
}

export interface SpeedRound {
  id: number;
  title: string;
  vehicle: VehicleConfig;
  distance: number;
  time: number;
  correctSpeed: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'boss';
  scenarioText: string;
  hint: string;
  eslNote?: string;
}

export interface DuelRound {
  id: number;
  title: string;
  vehicleA: VehicleConfig;
  distanceA: number;
  timeA: number;
  speedA: number;
  vehicleB: VehicleConfig;
  distanceB: number;
  timeB: number;
  speedB: number;
  winner: 'A' | 'B' | 'TIE';
}

export interface Achievement {
  id: string;
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface RaceResult {
  circuitId: string;
  circuitName: string;
  rank: number; // 1 = 1st Place, 2 = 2nd Place, etc.
  playerSpeed: number;
  distance: number;
  time: number;
  coinsEarned: number;
  xpEarned: number;
  nitroUsed: boolean;
}
