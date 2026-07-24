import React from 'react';
import { PowerUpType, ThemeConfig } from '../types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Hammer, Compass, Zap, Shield } from 'lucide-react';

interface ControlsProps {
  theme: ThemeConfig;
  inventory: Record<PowerUpType, number>;
  activePowerup: PowerUpType | null;
  onMove: (dx: number, dy: number) => void;
  onUsePowerup: (type: PowerUpType) => void;
  radarActive: boolean;
  freezeActive: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  theme,
  inventory,
  activePowerup,
  onMove,
  onUsePowerup,
  radarActive,
  freezeActive,
}) => {
  const powerupButtons: { id: PowerUpType; name: string; icon: React.ReactNode; colorClass: string; activeClass: string }[] = [
    {
      id: 'drill',
      name: 'Drill',
      icon: <Hammer size={16} id="ctrl-drill-icon" />,
      colorClass: 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
      activeClass: 'bg-amber-500 text-black ring-4 ring-amber-400/30 border-amber-400 scale-105',
    },
    {
      id: 'radar',
      name: 'Radar',
      icon: <Compass size={16} id="ctrl-radar-icon" />,
      colorClass: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20',
      activeClass: 'bg-cyan-500 text-black ring-4 ring-cyan-400/30 border-cyan-400 scale-105 animate-pulse',
    },
    {
      id: 'speed',
      name: 'Dash',
      icon: <Zap size={16} id="ctrl-speed-icon" />,
      colorClass: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20',
      activeClass: 'bg-yellow-500 text-black ring-4 ring-yellow-400/30 border-yellow-400 scale-105',
    },
    {
      id: 'freeze',
      name: 'Shield',
      icon: <Shield size={16} id="ctrl-freeze-icon" />,
      colorClass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
      activeClass: 'bg-emerald-500 text-black ring-4 ring-emerald-400/30 border-emerald-400 scale-105 animate-pulse',
    },
  ];

  return (
    <div id="controls-section-container" className="w-full flex flex-col items-center gap-3 mt-auto pb-2 border-t border-white/5 pt-3">
      {/* Powerups inventory quick panel */}
      <div id="ctrl-powerups-quick-row" className="w-full flex flex-col gap-1.5 px-1">
        <div className="flex justify-between items-center px-1" id="ctrl-inventory-label-row">
          <span className="text-[9px] font-mono font-semibold tracking-wider text-white/30 uppercase">Interactive Powerups</span>
          {activePowerup && (
            <span className="text-[9px] font-mono font-bold text-yellow-400 animate-pulse">
              Active: {activePowerup.toUpperCase()} Mode
            </span>
          )}
        </div>

        <div id="ctrl-powerups-grid" className="grid grid-cols-4 gap-2">
          {powerupButtons.map((btn) => {
            const count = inventory[btn.id] || 0;
            const isButtonActive = activePowerup === btn.id || (btn.id === 'radar' && radarActive) || (btn.id === 'freeze' && freezeActive);

            return (
              <button
                key={btn.id}
                id={`btn-use-powerup-${btn.id}`}
                onClick={() => onUsePowerup(btn.id)}
                disabled={count === 0}
                className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border relative transition-all active:scale-95 cursor-pointer ${
                  count === 0 ? 'opacity-30 border-white/5 bg-white/5 text-white/30 cursor-not-allowed' : ''
                } ${isButtonActive ? btn.activeClass : btn.colorClass}`}
              >
                {/* Badge count */}
                {count > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full text-[9px] font-mono font-bold flex items-center justify-center border ${
                    isButtonActive ? 'bg-white text-black border-slate-900' : 'bg-slate-950 text-white border-white/20'
                  }`} id={`badge-count-${btn.id}`}>
                    {count}
                  </span>
                )}
                {btn.icon}
                <span className="text-[8px] font-mono font-bold tracking-tight mt-1">{btn.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main D-Pad controls */}
      <div id="ctrl-dpad-wrapper" className="relative w-40 h-40 flex items-center justify-center mt-1">
        {/* Central Core Decorative circle */}
        <div id="dpad-center-core" className="absolute w-12 h-12 rounded-full bg-slate-950/80 border border-white/10 z-10 pointer-events-none shadow-inner flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>

        {/* Up Button */}
        <button
          id="btn-move-up"
          onClick={() => onMove(0, -1)}
          className="absolute top-0 w-12.5 h-12.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 active:scale-90 active:bg-white/20 transition-all flex items-center justify-center shadow-lg"
          title="Move Up"
        >
          <ChevronUp size={22} id="icon-move-up" />
        </button>

        {/* Left Button */}
        <button
          id="btn-move-left"
          onClick={() => onMove(-1, 0)}
          className="absolute left-0 w-12.5 h-12.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 active:scale-90 active:bg-white/20 transition-all flex items-center justify-center shadow-lg"
          title="Move Left"
        >
          <ChevronLeft size={22} id="icon-move-left" />
        </button>

        {/* Right Button */}
        <button
          id="btn-move-right"
          onClick={() => onMove(1, 0)}
          className="absolute right-0 w-12.5 h-12.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 active:scale-90 active:bg-white/20 transition-all flex items-center justify-center shadow-lg"
          title="Move Right"
        >
          <ChevronRight size={22} id="icon-move-right" />
        </button>

        {/* Down Button */}
        <button
          id="btn-move-down"
          onClick={() => onMove(0, 1)}
          className="absolute bottom-0 w-12.5 h-12.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 active:scale-90 active:bg-white/20 transition-all flex items-center justify-center shadow-lg"
          title="Move Down"
        >
          <ChevronDown size={22} id="icon-move-down" />
        </button>
      </div>

      <div id="desktop-instructions" className="text-[9px] text-white/20 font-mono text-center">
        <span>Desktop players can also use Keyboard Arrow Keys / WASD</span>
      </div>
    </div>
  );
};
