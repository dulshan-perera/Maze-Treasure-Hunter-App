import React, { useState } from 'react';
import { GameState, ThemeId, ThemeConfig, HighScore } from '../types';
import { THEMES } from '../utils/themes';
import { Play, HelpCircle, Trophy, Sparkles, Volume2, VolumeX, Shield, Compass, Hammer, Zap, Star } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../utils/sound';

interface GameMenuProps {
  currentTheme: ThemeConfig;
  onSelectTheme: (id: ThemeId) => void;
  onStartGame: () => void;
  highScores: HighScore[];
  onClearScores: () => void;
  soundState: boolean;
  onSoundToggle: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  currentTheme,
  onSelectTheme,
  onStartGame,
  highScores,
  onClearScores,
  soundState,
  onSoundToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'scores' | 'how-to'>('themes');

  const themesList = Object.values(THEMES);

  return (
    <div id="game-menu-container" className="flex flex-col h-full overflow-y-auto px-4 py-6 text-white select-none">
      {/* Game Title Logo Block */}
      <div id="menu-logo-section" className="text-center my-auto py-4 flex flex-col items-center">
        <div id="logo-icon-container" className="relative p-4 bg-yellow-400/10 rounded-3xl border border-yellow-400/20 mb-3 animate-bounce shadow-[0_0_15px_rgba(234,179,8,0.15)]">
          <Star size={36} className="text-yellow-400 fill-yellow-400" id="logo-star-icon" />
          <div className="absolute inset-0 bg-yellow-400/5 rounded-3xl animate-ping" />
        </div>
        
        <h1 id="logo-title" className="text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-mono">
          MAZE QUEST
        </h1>
        <p id="logo-subtitle" className="text-xs text-white/40 tracking-widest font-mono mt-1">THE TREASURE HUNTER</p>
      </div>

      {/* Start Button */}
      <div id="start-button-wrapper" className="my-3">
        <button
          id="btn-start-game"
          onClick={onStartGame}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-base uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_6px_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer border-b-4 border-amber-700"
        >
          <Play size={18} fill="currentColor" id="icon-menu-play" />
          <span>Launch Quest</span>
        </button>
      </div>

      {/* Navigation tabs */}
      <div id="menu-tabs-row" className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl mb-4 text-xs font-semibold font-mono">
        <button
          id="tab-themes"
          onClick={() => setActiveTab('themes')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
            activeTab === 'themes' ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white/80'
          }`}
        >
          Themes
        </button>
        <button
          id="tab-scores"
          onClick={() => setActiveTab('scores')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
            activeTab === 'scores' ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white/80'
          }`}
        >
          Highscores
        </button>
        <button
          id="tab-how-to"
          onClick={() => setActiveTab('how-to')}
          className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
            activeTab === 'how-to' ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white/80'
          }`}
        >
          How To Play
        </button>
      </div>

      {/* Content based on selected tab */}
      <div id="menu-tab-content-wrapper" className="flex-1 min-h-[180px] bg-black/30 rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
        
        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div id="themes-tab-content" className="flex flex-col gap-2 h-full">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Select Visual Theme</span>
            <div id="themes-list" className="grid grid-cols-2 gap-2 h-[150px] overflow-y-auto pr-1">
              {themesList.map((t) => (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => onSelectTheme(t.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-95 cursor-pointer ${
                    currentTheme.id === t.id
                      ? `border-yellow-400 bg-gradient-to-br ${t.primary} text-white`
                      : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight truncate">{t.name}</span>
                  <div className="flex gap-1 mt-2.5 items-center justify-between w-full" id={`theme-elements-preview-${t.id}`}>
                    <span className="text-[10px] font-mono opacity-50">Style:</span>
                    <div className="flex gap-1" id={`theme-dots-${t.id}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scores Tab */}
        {activeTab === 'scores' && (
          <div id="scores-tab-content" className="flex flex-col gap-2 h-full justify-between">
            <div>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Legendary Seekers</span>
              <div id="scores-table" className="flex flex-col gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                {highScores.length === 0 ? (
                  <p className="text-xs text-center text-white/30 py-4 font-mono">No records yet! Be the first!</p>
                ) : (
                  highScores.slice(0, 5).map((score, i) => (
                    <div
                      key={i}
                      id={`score-row-${i}`}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/5 border border-white/5 font-mono"
                    >
                      <div className="flex items-center gap-2" id={`score-left-${i}`}>
                        <span className="text-yellow-400/70 font-bold">#{i + 1}</span>
                        <span className="text-white/80 font-semibold truncate max-w-[100px]">{score.name}</span>
                      </div>
                      <div className="flex items-center gap-3" id={`score-right-${i}`}>
                        <span className="text-white/40 text-[10px]">Lvl {score.level}</span>
                        <span className="text-yellow-400 font-bold">{score.score}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {highScores.length > 0 && (
              <button
                id="btn-clear-scores"
                onClick={onClearScores}
                className="text-[10px] text-white/30 hover:text-red-400 font-mono transition-all self-center py-1 border-t border-dashed border-white/10 w-full text-center"
              >
                Reset Scoreboard
              </button>
            )}
          </div>
        )}

        {/* How To Play Tab */}
        {activeTab === 'how-to' && (
          <div id="how-to-tab-content" className="flex flex-col gap-2 text-xs font-sans h-full overflow-y-auto max-h-[160px] pr-1">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Adventure Instructions</span>
            
            <div id="how-to-instruction-scroller" className="flex flex-col gap-2 text-white/80 leading-relaxed font-mono text-[10px]">
              <div className="flex items-start gap-2" id="instruction-step-1">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1" />
                <p><strong>Goal:</strong> Guide your character from the starting corner to the hidden golden treasure chest to clear the stage.</p>
              </div>

              <div className="flex items-start gap-2" id="instruction-step-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1" />
                <p><strong>Controls:</strong> Use the on-screen <strong>D-Pad / Joystick</strong> (perfect for touch devices) or standard desktop <strong>Keyboard Arrow keys (or WASD)</strong>.</p>
              </div>

              <div className="flex items-start gap-2" id="instruction-step-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
                <p><strong>Enemies & Traps:</strong> Avoid spike traps (they switch states!) and patrolling guards in later stages to save lives.</p>
              </div>

              <div className="flex items-start gap-2" id="instruction-step-4">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1" />
                <p><strong>Shop & Items:</strong> Collect shiny gold coins to buy crucial powerups at the Level Complete screen:</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pl-3 text-[9px] mt-0.5" id="power-ups-how-to-grid">
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-md border border-white/5" id="how-to-powerup-drill">
                  <Hammer size={10} className="text-amber-400" id="icon-how-to-drill" />
                  <span>Drill (Break walls)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-md border border-white/5" id="how-to-powerup-radar">
                  <Compass size={10} className="text-cyan-400" id="icon-how-to-radar" />
                  <span>Radar (Find paths)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-md border border-white/5" id="how-to-powerup-speed">
                  <Zap size={10} className="text-yellow-400" id="icon-how-to-speed" />
                  <span>Dash (Time + Speed)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-md border border-white/5" id="how-to-powerup-shield">
                  <Shield size={10} className="text-emerald-400" id="icon-how-to-shield" />
                  <span>Shield (Immunities)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* App Footer Settings Row */}
      <div id="menu-footer-settings" className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-[10px] text-white/30 font-mono">
        <span>© 2026 Retro Arcade Studio</span>
        <button
          id="btn-sound-footer-toggle"
          onClick={onSoundToggle}
          className="flex items-center gap-1 hover:text-white/80 transition-all active:scale-95"
        >
          {soundState ? (
            <>
              <Volume2 size={12} id="icon-footer-sound-on" />
              <span>Audio Active</span>
            </>
          ) : (
            <>
              <VolumeX size={12} id="icon-footer-sound-off" className="text-red-400" />
              <span>Audio Muted</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
