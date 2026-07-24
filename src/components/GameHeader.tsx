import React from 'react';
import { Player, ThemeConfig } from '../types';
import { Coins, Trophy, Timer, Heart, Volume2, VolumeX, Pause, Play, HelpCircle, ArrowLeft } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../utils/sound';

interface GameHeaderProps {
  player: Player;
  theme: ThemeConfig;
  isPaused: boolean;
  onPauseToggle: () => void;
  onBackToMenu: () => void;
  onShowHelp: () => void;
  soundState: boolean;
  onSoundToggle: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  player,
  theme,
  isPaused,
  onPauseToggle,
  onBackToMenu,
  onShowHelp,
  soundState,
  onSoundToggle,
}) => {
  // Format time (mm:ss or just ss)
  const formatTime = (seconds: number) => {
    if (seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeLow = player.timeLeft <= 15;

  return (
    <div id="game-header-container" className="w-full flex flex-col gap-2.5 pb-3 border-b border-white/10">
      {/* Top action row */}
      <div id="header-top-row" className="flex items-center justify-between">
        <button
          id="btn-back-to-menu"
          onClick={onBackToMenu}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all active:scale-95 flex items-center gap-1 text-xs"
        >
          <ArrowLeft size={16} id="icon-back-arrow" />
          <span>Exit</span>
        </button>

        <div id="header-center-title" className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-white/50 tracking-wider">LEVEL</span>
          <span className="text-lg font-bold font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
            {player.level}
          </span>
        </div>

        <div id="header-actions" className="flex items-center gap-1.5">
          <button
            id="btn-toggle-help"
            onClick={onShowHelp}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all active:scale-95"
            title="How to Play"
          >
            <HelpCircle size={17} id="icon-help" />
          </button>
          
          <button
            id="btn-toggle-sound"
            onClick={onSoundToggle}
            className={`p-1.5 rounded-lg transition-all active:scale-95 ${
              soundState ? 'bg-white/5 text-white/80' : 'bg-red-950/40 text-red-400 border border-red-900/30'
            }`}
            title={soundState ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundState ? <Volume2 size={17} id="icon-sound-on" /> : <VolumeX size={17} id="icon-sound-off" />}
          </button>

          <button
            id="btn-toggle-pause"
            onClick={onPauseToggle}
            className={`p-1.5 rounded-lg transition-all active:scale-95 ${
              isPaused ? 'bg-yellow-500 text-slate-950' : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play size={17} id="icon-resume" /> : <Pause size={17} id="icon-pause" />}
          </button>
        </div>
      </div>

      {/* Main Stats HUD Grid */}
      <div id="header-stats-hud" className="grid grid-cols-4 gap-2">
        {/* Score Card */}
        <div id="hud-score-card" className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 uppercase tracking-tight">
            <Trophy size={11} className="text-indigo-400" id="icon-hud-trophy" />
            <span>Score</span>
          </div>
          <span className="text-sm font-bold font-mono text-white mt-0.5">{player.score}</span>
        </div>

        {/* Coins Card */}
        <div id="hud-coins-card" className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 uppercase tracking-tight">
            <Coins size={11} className="text-amber-400" id="icon-hud-coins" />
            <span>Coins</span>
          </div>
          <span className="text-sm font-bold font-mono text-amber-400 mt-0.5">{player.coins}</span>
        </div>

        {/* Lives Card */}
        <div id="hud-lives-card" className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 uppercase tracking-tight">
            <Heart size={11} className="text-rose-500" id="icon-hud-heart" />
            <span>Lives</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1" id="lives-hearts-container">
            {Array.from({ length: Math.max(0, player.lives) }).map((_, i) => (
              <Heart
                key={i}
                size={10}
                className="text-rose-500 fill-rose-500 animate-pulse"
                id={`icon-heart-hp-${i}`}
              />
            ))}
            {player.lives <= 0 && <span className="text-xs font-mono font-bold text-rose-500">None</span>}
          </div>
        </div>

        {/* Timer Card */}
        <div
          id="hud-timer-card"
          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 ${
            isTimeLow
              ? 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse'
              : 'bg-white/5 border-white/10 text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 uppercase tracking-tight">
            <Timer size={11} id="icon-hud-timer" />
            <span>Time</span>
          </div>
          <span className="text-sm font-bold font-mono mt-0.5">{formatTime(player.timeLeft)}</span>
        </div>
      </div>
    </div>
  );
};
