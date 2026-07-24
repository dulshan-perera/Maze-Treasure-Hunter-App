import React from 'react';
import { Player, ThemeConfig } from '../types';
import { Sparkles, Trophy, ArrowRight, ShoppingCart, Coins, Timer, Footprints } from 'lucide-react';

interface LevelCompleteModalProps {
  player: Player;
  theme: ThemeConfig;
  levelCoinsCollected: number;
  levelBonusScore: number;
  onNextLevel: () => void;
  onOpenShop: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  player,
  theme,
  levelCoinsCollected,
  levelBonusScore,
  onNextLevel,
  onOpenShop,
}) => {
  // Determine performance rating (stars) based on remaining time
  const getStarRating = () => {
    if (player.timeLeft > 40) return 3;
    if (player.timeLeft > 15) return 2;
    return 1;
  };

  const stars = getStarRating();

  return (
    <div id="win-modal-overlay" className="absolute inset-0 bg-black/85 flex items-center justify-center z-40 p-4">
      <div id="win-modal-card" className={`w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5 text-center shadow-2xl animate-fade-in relative ${theme.cardClass}`}>
        
        {/* Animated Glitter Star */}
        <div id="win-header-icon" className="mx-auto bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-full text-amber-400 relative">
          <Sparkles size={32} className="animate-spin duration-3000" id="icon-win-sparkle" />
          <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping pointer-events-none" />
        </div>

        {/* Title */}
        <div id="win-title-wrap">
          <h2 className="text-2xl font-black font-mono tracking-tight text-yellow-400">STAGE CLEAR!</h2>
          <p className="text-xs text-white/50 uppercase tracking-widest font-mono mt-1">Level {player.level - 1} Conquered</p>
        </div>

        {/* Level Rating Stars */}
        <div id="win-stars-row" className="flex items-center justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Trophy
              key={i}
              size={28}
              id={`win-star-trophy-${i}`}
              className={`transition-all duration-700 ${
                i < stars ? 'text-yellow-400 drop-shadow-[0_0_8px_#fbbf24] scale-110' : 'text-stone-700'
              }`}
            />
          ))}
        </div>

        {/* Statistics breakdown */}
        <div id="win-stats-grid" className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-3 rounded-xl font-mono text-xs">
          <div id="win-stat-moves" className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-white/40 mb-1">
              <Footprints size={12} id="icon-win-moves" />
              <span>Moves</span>
            </div>
            <span className="text-white font-bold text-sm">{player.moves}</span>
          </div>

          <div id="win-stat-coins" className="flex flex-col items-center border-x border-white/10">
            <div className="flex items-center gap-1 text-amber-400/80 mb-1">
              <Coins size={12} id="icon-win-coins" />
              <span>Coins</span>
            </div>
            <span className="text-amber-400 font-bold text-sm">+{levelCoinsCollected}</span>
          </div>

          <div id="win-stat-time" className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-400/80 mb-1">
              <Timer size={12} id="icon-win-timer" />
              <span>Left</span>
            </div>
            <span className="text-emerald-400 font-bold text-sm">{player.timeLeft}s</span>
          </div>
        </div>

        {/* Score gained block */}
        <div id="win-score-box" className="bg-indigo-500/10 border border-indigo-500/20 py-2.5 px-4 rounded-xl flex items-center justify-between">
          <span className="text-xs font-mono text-white/60">Stage Bonus:</span>
          <span className="text-base font-bold font-mono text-indigo-300">+{levelBonusScore} Pts</span>
        </div>

        {/* Action Buttons */}
        <div id="win-actions-container" className="flex flex-col gap-2.5 mt-2">
          {/* Continue Button */}
          <button
            id="btn-win-next-stage"
            onClick={onNextLevel}
            className={`w-full py-3 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
              theme.id === 'classic' ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-amber-500 hover:bg-amber-400'
            }`}
          >
            <span>Next Stage</span>
            <ArrowRight size={16} id="icon-win-next" />
          </button>

          {/* Shop Button */}
          <button
            id="btn-win-open-shop"
            onClick={onOpenShop}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <ShoppingCart size={14} id="icon-win-shop" />
            <span>Visit Power-up Shop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
