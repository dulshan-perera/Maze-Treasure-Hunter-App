export type GameState = 'MENU' | 'PLAYING' | 'SHOP' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'HOW_TO_PLAY';

export type ThemeId = 'vibrant' | 'classic' | 'dungeon' | 'cyberpunk' | 'forest' | 'cosmic';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  primary: string;
  bgClass: string;
  cardClass: string;
  wallClass: string;
  pathClass: string;
  playerClass: string;
  treasureClass: string;
  enemyClass: string;
  coinClass: string;
  buttonClass: string;
  accentColor: string;
}

export type PowerUpType = 'drill' | 'radar' | 'speed' | 'freeze';

export interface PowerUp {
  id: PowerUpType;
  name: string;
  description: string;
  cost: number;
  count: number;
  iconName: string;
}

export interface Cell {
  x: number;
  y: number;
  isWall: boolean;
  hasCoin: boolean;
  hasPowerup: PowerUpType | null;
  hasTreasure: boolean;
  isPathHint?: boolean; // Highlighted by radar
  hasSpikes?: boolean;  // Trap obstacle
  spikesActive?: boolean;
}

export interface Player {
  x: number;
  y: number;
  lives: number;
  coins: number;
  score: number;
  level: number;
  moves: number;
  timeLeft: number;
  speedActive: boolean; // Speed powerup active
  freezeActive: boolean; // Freeze / Shield active
}

export interface HighScore {
  name: string;
  score: number;
  level: number;
  date: string;
}
