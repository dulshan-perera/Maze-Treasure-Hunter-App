import React from 'react';
import { Cell, ThemeConfig, PowerUpType } from '../types';
import { Hammer, Star } from 'lucide-react';

interface Enemy {
  id: number;
  x: number;
  y: number;
}

interface GameBoardProps {
  grid: Cell[][];
  theme: ThemeConfig;
  playerX: number;
  playerY: number;
  treasureX: number;
  treasureY: number;
  enemies: Enemy[];
  radarActive: boolean;
  freezeActive: boolean;
  activePowerup: PowerUpType | null;
  onCellClick: (x: number, y: number) => void;
  shortestPath: { x: number; y: number }[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  theme,
  playerX,
  playerY,
  treasureX,
  treasureY,
  enemies,
  radarActive,
  freezeActive,
  activePowerup,
  onCellClick,
  shortestPath,
}) => {
  const height = grid.length;
  const width = grid[0]?.length || 0;

  // Map theme IDs to specific emojis
  const getThemeAssets = (themeId: string) => {
    switch (themeId) {
      case 'vibrant':
        return {
          player: freezeActive ? '🏃‍♂️❄️' : '🏃‍♂️',
          treasure: '💎',
          coin: '🌟',
          enemy: freezeActive ? '👾🧊' : '👾',
          powerupDrill: '🔨',
          powerupRadar: '🧭',
          powerupSpeed: '⚡',
          powerupFreeze: '🛡️',
          spikesUp: '🔺',
          spikesDown: '🔻',
        };
      case 'dungeon':
        return {
          player: freezeActive ? '🧙‍♂️❄️' : '🧙‍♂️',
          treasure: '👑',
          coin: '🪙',
          enemy: freezeActive ? '👾🧊' : '👹',
          powerupDrill: '⛏️',
          powerupRadar: '🧭',
          powerupSpeed: '⚡',
          powerupFreeze: '🛡️',
          spikesUp: '🌋',
          spikesDown: '🕳️',
        };
      case 'cyberpunk':
        return {
          player: freezeActive ? '🤖❄️' : '🤖',
          treasure: '💾',
          coin: '🟩',
          enemy: freezeActive ? '🔌🧊' : '👾',
          powerupDrill: '🔧',
          powerupRadar: '📟',
          powerupSpeed: '🔥',
          powerupFreeze: '💎',
          spikesUp: '⚡',
          spikesDown: '⬛',
        };
      case 'forest':
        return {
          player: freezeActive ? '🦊❄️' : '🦊',
          treasure: '🌟',
          coin: '🌰',
          enemy: freezeActive ? '🐍🧊' : '🐗',
          powerupDrill: '🪵',
          powerupRadar: '🗺️',
          powerupSpeed: '🍓',
          powerupFreeze: '🍀',
          spikesUp: '🌵',
          spikesDown: '🪹',
        };
      case 'cosmic':
        return {
          player: freezeActive ? '🚀❄️' : '🚀',
          treasure: '🪐',
          coin: '✨',
          enemy: freezeActive ? '👽🧊' : '🛸',
          powerupDrill: '💥',
          powerupRadar: '📡',
          powerupSpeed: '🌠',
          powerupFreeze: '🔮',
          spikesUp: '☄️',
          spikesDown: '🕳️',
        };
      case 'classic':
      default:
        return {
          player: freezeActive ? '🕹️❄️' : '🕹️',
          treasure: '🏆',
          coin: '🟡',
          enemy: freezeActive ? '👻🧊' : '👻',
          powerupDrill: '🔨',
          powerupRadar: '🧭',
          powerupSpeed: '⚡',
          powerupFreeze: '🛡️',
          spikesUp: '🔺',
          spikesDown: '🔻',
        };
    }
  };

  const assets = getThemeAssets(theme.id);

  // Check if a cell is part of the radar path
  const isCellInRadarPath = (x: number, y: number) => {
    if (!radarActive) return false;
    return shortestPath.some((pt) => pt.x === x && pt.y === y);
  };

  // Check if cell has an enemy
  const getEnemyAtCell = (x: number, y: number) => {
    return enemies.find((e) => e.x === x && e.y === y);
  };

  return (
    <div
      id="game-board-outer-container"
      className="w-full flex items-center justify-center bg-black/40 border border-white/10 rounded-2xl p-2 shadow-inner overflow-hidden relative"
      style={{ aspectRatio: '1 / 1' }}
    >
      {/* Dynamic Grid Layout */}
      <div
        id="maze-grid"
        className="grid w-full h-full gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isPlayer = playerX === x && playerY === y;
            const enemy = getEnemyAtCell(x, y);
            const isRadarPath = isCellInRadarPath(x, y);
            const isAdjacentToPlayer = Math.abs(playerX - x) + Math.abs(playerY - y) === 1;
            const canDrillCell = activePowerup === 'drill' && cell.isWall && isAdjacentToPlayer;

            return (
              <div
                key={`${x}-${y}`}
                id={`cell-${x}-${y}`}
                onClick={() => onCellClick(x, y)}
                className={`relative flex items-center justify-center rounded-[2px] transition-all duration-150 select-none ${
                  cell.isWall ? theme.wallClass : theme.pathClass
                } ${
                  canDrillCell ? 'ring-2 ring-amber-400 hover:brightness-125 cursor-pointer animate-pulse' : ''
                } ${
                  isRadarPath ? 'shadow-[0_0_8px_#10b981_inset] border border-emerald-500/50 bg-emerald-950/20' : ''
                }`}
              >
                {/* 1. Wall Driller Target Overlay */}
                {canDrillCell && (
                  <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center text-amber-400 text-[10px]" id={`drill-target-${x}-${y}`}>
                    <Hammer size={12} className="animate-bounce" id={`icon-drill-target-${x}-${y}`} />
                  </div>
                )}

                {/* 2. Path Guide Indicator Dot */}
                {isRadarPath && !isPlayer && !cell.hasTreasure && !cell.hasCoin && !cell.hasPowerup && !enemy && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" id={`radar-dot-${x}-${y}`} />
                )}

                {/* 3. Render Cell Content */}
                {!cell.isWall && (
                  <div id={`cell-content-${x}-${y}`} className="flex items-center justify-center w-full h-full text-xs font-bold">
                    {isPlayer ? (
                      <span id={`player-sprite-${x}-${y}`} className="text-sm scale-125 transform transition-transform animate-pulse z-20">
                        {assets.player}
                      </span>
                    ) : enemy ? (
                      <span id={`enemy-sprite-${x}-${y}`} className={`text-sm scale-110 transform transition-transform z-10 ${freezeActive ? 'brightness-75 scale-95 opacity-80' : 'animate-bounce'}`}>
                        {assets.enemy}
                      </span>
                    ) : cell.hasTreasure ? (
                      <span id={`treasure-sprite-${x}-${y}`} className="text-base scale-125 animate-pulse z-10">
                        {assets.treasure}
                      </span>
                    ) : cell.hasCoin ? (
                      <span id={`coin-sprite-${x}-${y}`} className="text-[10px] transform hover:scale-125 transition-transform">
                        {assets.coin}
                      </span>
                    ) : cell.hasPowerup ? (
                      <span id={`powerup-sprite-${x}-${y}`} className="text-xs scale-115 animate-bounce text-yellow-400">
                        {cell.hasPowerup === 'drill' && assets.powerupDrill}
                        {cell.hasPowerup === 'radar' && assets.powerupRadar}
                        {cell.hasPowerup === 'speed' && assets.powerupSpeed}
                        {cell.hasPowerup === 'freeze' && assets.powerupFreeze}
                      </span>
                    ) : cell.hasSpikes ? (
                      <span id={`spikes-sprite-${x}-${y}`} className="text-[10px] opacity-90">
                        {cell.spikesActive ? assets.spikesUp : assets.spikesDown}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Mini Overlay for active screen status effects */}
      {freezeActive && (
        <div id="freeze-timer-overlay" className="absolute top-2 left-2 bg-sky-950/80 border border-sky-400/40 text-sky-300 font-mono text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse z-30">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          <span>SHIELDED</span>
        </div>
      )}
      {radarActive && (
        <div id="radar-timer-overlay" className="absolute top-2 right-2 bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 font-mono text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse z-30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>RADAR ACTIVE</span>
        </div>
      )}
    </div>
  );
};
