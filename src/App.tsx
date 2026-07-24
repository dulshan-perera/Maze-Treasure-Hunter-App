import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ThemeId, ThemeConfig, PowerUpType, Cell, Player, HighScore } from './types';
import { THEMES } from './utils/themes';
import { generateMaze, findShortestPath } from './utils/maze';
import {
  playMoveSound,
  playCoinSound,
  playPowerUpSound,
  playDrillSound,
  playRadarSound,
  playWinSound,
  playGameOverSound,
  playDamageSound,
  isSoundEnabled,
  setSoundEnabled,
} from './utils/sound';
import { GameHeader } from './components/GameHeader';
import { GameMenu } from './components/GameMenu';
import { GameBoard } from './components/GameBoard';
import { Controls } from './components/Controls';
import { ShopModal } from './components/ShopModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import {
  Trophy,
  Skull,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  Play,
  Heart,
  Timer,
  Coins,
  ChevronRight,
  Info,
  ShieldAlert,
} from 'lucide-react';

// Default mock high scores for a complete-feeling experience on first load
const DEFAULT_SCORES: HighScore[] = [
  { name: 'KnightSeeker', score: 2450, level: 6, date: '2026-07-15' },
  { name: 'SpeedyMaze', score: 1800, level: 4, date: '2026-07-18' },
  { name: 'DrillMaster', score: 1250, level: 3, date: '2026-07-19' },
  { name: 'CosmoCap', score: 800, level: 2, date: '2026-07-19' },
];

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [themeId, setThemeId] = useState<ThemeId>('vibrant');
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Stats & Inventory
  const [player, setPlayer] = useState<Player>({
    x: 1,
    y: 1,
    lives: 3,
    coins: 0,
    score: 0,
    level: 1,
    moves: 0,
    timeLeft: 90,
    speedActive: false,
    freezeActive: false,
  });

  const [inventory, setInventory] = useState<Record<PowerUpType, number>>({
    drill: 1,
    radar: 1,
    speed: 0,
    freeze: 0,
  });

  // Maze state
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [startX, setStartX] = useState(1);
  const [startY, setStartY] = useState(1);
  const [treasureX, setTreasureX] = useState(1);
  const [treasureY, setTreasureY] = useState(1);
  const [shortestPath, setShortestPath] = useState<{ x: number; y: number }[]>([]);

  // Active status effects
  const [activePowerup, setActivePowerup] = useState<PowerUpType | null>(null);
  const [radarActive, setRadarActive] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [invincible, setInvincible] = useState(false);

  // Level transition caches for final display
  const [levelCoinsCollected, setLevelCoinsCollected] = useState(0);
  const [levelBonusScore, setLevelBonusScore] = useState(0);

  // Enemies
  const [enemies, setEnemies] = useState<{ id: number; x: number; y: number }[]>([]);

  // High Scores list
  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    const cached = localStorage.getItem('maze_quest_high_scores');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_SCORES;
      }
    }
    return DEFAULT_SCORES;
  });

  // Theme Config
  const theme = THEMES[themeId] || THEMES.classic;

  // Sync sound settings
  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  // Load / Setup current level
  const setupLevel = useCallback((level: number, keepStats = true) => {
    // Maze sizing gets larger and tougher as level rises
    // Level 1: 9x9, Level 2: 13x13, Level 3: 17x17, Level 4: 19x19, Level 5+: 21x21
    let width = 9;
    let height = 9;
    if (level === 2) {
      width = 13;
      height = 13;
    } else if (level === 3) {
      width = 17;
      height = 17;
    } else if (level === 4) {
      width = 19;
      height = 19;
    } else if (level >= 5) {
      width = 21;
      height = 21;
    }

    const levelTime = Math.max(45, 100 - level * 10); // Decreasing time limit

    const generated = generateMaze(width, height, level);
    setGrid(generated.grid);
    setStartX(generated.startX);
    setStartY(generated.startY);
    setTreasureX(generated.treasureX);
    setTreasureY(generated.treasureY);

    // Calculate initial shortest path
    const initialPath = findShortestPath(
      generated.grid,
      generated.startX,
      generated.startY,
      generated.treasureX,
      generated.treasureY
    );
    setShortestPath(initialPath);

    // Setup enemies on level 2 and above
    const enemyList = [];
    if (level >= 2) {
      const enemyCount = Math.min(5, level - 1);
      // Pick random open path coordinates far from start position
      const pathCoordinates: { x: number; y: number }[] = [];
      for (let y = 1; y < generated.grid.length - 1; y++) {
        for (let x = 1; x < generated.grid[0].length - 1; x++) {
          if (!generated.grid[y][x].isWall && !(x === generated.startX && y === generated.startY) && !(x === generated.treasureX && y === generated.treasureY)) {
            // Distance check
            const dist = Math.abs(generated.startX - x) + Math.abs(generated.startY - y);
            if (dist > 5) {
              pathCoordinates.push({ x, y });
            }
          }
        }
      }

      // Shuffle and pick
      const shuffledPaths = pathCoordinates.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(enemyCount, shuffledPaths.length); i++) {
        enemyList.push({
          id: i + 1,
          x: shuffledPaths[i].x,
          y: shuffledPaths[i].y,
        });
      }
    }
    setEnemies(enemyList);

    // Reset temporary buffs
    setRadarActive(false);
    setFreezeActive(false);
    setActivePowerup(null);
    setIsPaused(false);
    setInvincible(false);

    setPlayer((prev) => ({
      ...prev,
      x: generated.startX,
      y: generated.startY,
      level: level,
      timeLeft: levelTime,
      moves: 0,
      lives: keepStats ? prev.lives : 3,
      coins: keepStats ? prev.coins : 0,
      score: keepStats ? prev.score : 0,
    }));
    setLevelCoinsCollected(0);
    setLevelBonusScore(0);
  }, []);

  // Keyboard and movement dispatcher
  const handlePlayerMove = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== 'PLAYING' || isPaused) return;

      setPlayer((prev) => {
        const nx = prev.x + dx;
        const ny = prev.y + dy;

        // Bounds check
        if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) {
          return prev;
        }

        const targetCell = grid[ny][nx];

        // 1. Drill Active Blockage Breaker Mode
        if (activePowerup === 'drill') {
          if (targetCell.isWall) {
            // Break the wall!
            const nextGrid = [...grid];
            nextGrid[ny][nx] = {
              ...targetCell,
              isWall: false,
            };
            setGrid(nextGrid);
            setActivePowerup(null); // Consumed
            setInventory((inv) => ({ ...inv, drill: Math.max(0, inv.drill - 1) }));
            playDrillSound();

            // Re-calculate shortest path in case path changed
            const updatedPath = findShortestPath(nextGrid, prev.x, prev.y, treasureX, treasureY);
            setShortestPath(updatedPath);

            return { ...prev, moves: prev.moves + 1 };
          }
        }

        // 2. Regular wall collision check
        if (targetCell.isWall) {
          return prev;
        }

        // Safe move
        playMoveSound();

        const updatedGrid = [...grid];
        let coinBonus = 0;
        let scoreBonus = 0;

        // Collect Coin
        if (targetCell.hasCoin) {
          updatedGrid[ny][nx] = { ...targetCell, hasCoin: false };
          coinBonus = 1;
          scoreBonus = 15;
          setLevelCoinsCollected((c) => c + 1);
          playCoinSound();
        }

        // Collect Ground Power-up reward
        if (targetCell.hasPowerup) {
          const type = targetCell.hasPowerup;
          updatedGrid[ny][nx] = { ...targetCell, hasPowerup: null };
          setInventory((inv) => ({ ...inv, [type]: (inv[type] || 0) + 1 }));
          scoreBonus = 30;
          playPowerUpSound();
        }

        setGrid(updatedGrid);

        // Check Trap collision
        let livesPenalty = 0;
        if (targetCell.hasSpikes && targetCell.spikesActive && !freezeActive && !invincible) {
          livesPenalty = 1;
          setInvincible(true);
          playDamageSound();
          setTimeout(() => setInvincible(false), 1500);
        }

        // Check if player found the Golden Treasure
        if (nx === treasureX && ny === treasureY) {
          // Celebrate Win!
          setTimeout(() => {
            handleLevelWin();
          }, 100);
        }

        // Recalculate radar paths
        const currentPath = findShortestPath(updatedGrid, nx, ny, treasureX, treasureY);
        setShortestPath(currentPath);

        return {
          ...prev,
          x: nx,
          y: ny,
          moves: prev.moves + 1,
          coins: prev.coins + coinBonus,
          score: prev.score + scoreBonus,
          lives: Math.max(0, prev.lives - livesPenalty),
        };
      });
    },
    [grid, activePowerup, gameState, isPaused, treasureX, treasureY, freezeActive, invincible]
  );

  // Cell click logic (primarily for easy Drill activation)
  const handleCellClick = (cx: number, cy: number) => {
    if (gameState !== 'PLAYING' || isPaused) return;

    // Drill usage on cell tap
    const dx = cx - player.x;
    const dy = cy - player.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    if (activePowerup === 'drill' && distance === 1) {
      handlePlayerMove(dx, dy);
    }
  };

  // Keyboard controls listener hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING' || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handlePlayerMove(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handlePlayerMove(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handlePlayerMove(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handlePlayerMove(1, 0);
          break;
        case 'Escape':
          setIsPaused((p) => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isPaused, handlePlayerMove]);

  // Main countdown game loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;

    const timer = setInterval(() => {
      setPlayer((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          handleGameOver();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isPaused]);

  // Spikes (Trap) periodic toggle loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused) return;

    const trapTimer = setInterval(() => {
      setGrid((prevGrid) => {
        return prevGrid.map((row) =>
          row.map((cell) => {
            if (cell.hasSpikes) {
              return { ...cell, spikesActive: !cell.spikesActive };
            }
            return cell;
          })
        );
      });
    }, 2000);

    return () => clearInterval(trapTimer);
  }, [gameState, isPaused]);

  // Enemy movement AI loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || isPaused || freezeActive) return;

    const enemyTimer = setInterval(() => {
      setEnemies((prevEnemies) => {
        return prevEnemies.map((enemy) => {
          // Simple intelligent movement: 50% chance move towards player, 50% chance random move
          const moveTowards = Math.random() < 0.6;
          const possibleMoves: { dx: number; dy: number }[] = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
          ];

          // Filter valid moves (not wall, not treasure)
          const validMoves = possibleMoves.filter((m) => {
            const nx = enemy.x + m.dx;
            const ny = enemy.y + m.dy;
            if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
              return !grid[ny][nx].isWall;
            }
            return false;
          });

          if (validMoves.length === 0) return enemy;

          let chosenMove = validMoves[Math.floor(Math.random() * validMoves.length)];

          if (moveTowards) {
            // Find moves that minimize Manhattan distance to player
            let bestMove = chosenMove;
            let minDist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);

            for (const move of validMoves) {
              const nx = enemy.x + move.dx;
              const ny = enemy.y + move.dy;
              const dist = Math.abs(nx - player.x) + Math.abs(ny - player.y);
              if (dist < minDist) {
                minDist = dist;
                bestMove = move;
              }
            }
            chosenMove = bestMove;
          }

          return {
            ...enemy,
            x: enemy.x + chosenMove.dx,
            y: enemy.y + chosenMove.dy,
          };
        });
      });
    }, 750);

    return () => clearInterval(enemyTimer);
  }, [gameState, isPaused, freezeActive, player.x, player.y, grid]);

  // Collision checking with moving enemies
  useEffect(() => {
    if (gameState !== 'PLAYING' || invincible || freezeActive) return;

    const hitEnemy = enemies.find((e) => e.x === player.x && e.y === player.y);
    if (hitEnemy) {
      setInvincible(true);
      playDamageSound();
      setPlayer((prev) => ({
        ...prev,
        lives: Math.max(0, prev.lives - 1),
      }));
      setTimeout(() => setInvincible(false), 1500);
    }
  }, [enemies, player.x, player.y, gameState, invincible, freezeActive]);

  // Handle lives depletion
  useEffect(() => {
    if (player.lives <= 0 && gameState === 'PLAYING') {
      handleGameOver();
    }
  }, [player.lives, gameState]);

  // Active status power-up timers
  useEffect(() => {
    if (radarActive) {
      const radarTimer = setTimeout(() => {
        setRadarActive(false);
      }, 5000);
      return () => clearTimeout(radarTimer);
    }
  }, [radarActive]);

  useEffect(() => {
    if (freezeActive) {
      const freezeTimer = setTimeout(() => {
        setFreezeActive(false);
      }, 6000);
      return () => clearTimeout(freezeTimer);
    }
  }, [freezeActive]);

  // Handle Game Over
  const handleGameOver = () => {
    setGameState('GAME_OVER');
    playGameOverSound();
    saveHighScore();
  };

  // Handle Win/Level Clear
  const handleLevelWin = () => {
    playWinSound();

    // Calculate score bonuses
    const timeBonus = player.timeLeft * 10;
    const levelMultiplier = 100 * player.level;
    const finalBonus = timeBonus + levelMultiplier;

    setLevelBonusScore(finalBonus);

    setPlayer((prev) => ({
      ...prev,
      score: prev.score + finalBonus,
    }));

    setGameState('LEVEL_COMPLETE');
  };

  // Save score to local leaderboard
  const saveHighScore = () => {
    if (player.score === 0) return;

    const namePrompt = prompt('Enter your name for the Scoreboard:', 'Player');
    const finalName = namePrompt?.trim() || 'Hero';

    const newScore: HighScore = {
      name: finalName,
      score: player.score,
      level: player.level,
      date: new Date().toISOString().split('T')[0],
    };

    setHighScores((prev) => {
      const updated = [...prev, newScore].sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem('maze_quest_high_scores', JSON.stringify(updated));
      return updated;
    });
  };

  // Trigger Powerup Consumption
  const handleUsePowerup = (type: PowerUpType) => {
    if (gameState !== 'PLAYING' || isPaused) return;
    if ((inventory[type] || 0) <= 0) return;

    switch (type) {
      case 'drill':
        // Turn on Drill activation state (lets you break wall next)
        if (activePowerup === 'drill') {
          setActivePowerup(null);
        } else {
          setActivePowerup('drill');
        }
        break;

      case 'radar':
        setInventory((inv) => ({ ...inv, radar: Math.max(0, inv.radar - 1) }));
        setRadarActive(true);
        playRadarSound();
        break;

      case 'speed':
        setInventory((inv) => ({ ...inv, speed: Math.max(0, inv.speed - 1) }));
        setPlayer((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft + 20, // Give them 20 seconds extra
        }));
        playPowerUpSound();
        break;

      case 'freeze':
        setInventory((inv) => ({ ...inv, freeze: Math.max(0, inv.freeze - 1) }));
        setFreezeActive(true);
        setPlayer((prev) => ({
          ...prev,
          lives: Math.min(3, prev.lives + 1), // Restore a life
        }));
        playPowerUpSound();
        break;
    }
  };

  const handlePurchasePowerup = (type: PowerUpType, cost: number) => {
    setPlayer((prev) => ({ ...prev, coins: prev.coins - cost }));
    setInventory((inv) => ({ ...inv, [type]: (inv[type] || 0) + 1 }));
  };

  const handleClearScores = () => {
    if (confirm('Clear the entire highscore board?')) {
      localStorage.removeItem('maze_quest_high_scores');
      setHighScores([]);
    }
  };

  const handleStartGame = () => {
    setupLevel(1, false); // Start from Level 1, reset stats
    setGameState('PLAYING');
  };

  const handleNextLevel = () => {
    setupLevel(player.level + 1, true); // Keep inventory & score, increase level!
    setGameState('PLAYING');
  };

  return (
    <div
      id="root-app-viewport"
      className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-3 text-slate-100 selection:bg-indigo-500/30 overflow-y-auto"
    >
      {/* Simulation Device Frame Wrapper - Perfect for Play Store download demo */}
      <div
        id="phone-frame-wrapper"
        className="w-full max-w-sm h-[94vh] max-h-[820px] bg-slate-900 rounded-[36px] shadow-2xl flex flex-col overflow-hidden border-[6px] border-slate-800 relative shadow-indigo-950/20"
      >
        {/* Notch / Speaker bar */}
        <div id="phone-notch" className="absolute top-0 inset-x-0 h-5 bg-slate-950 flex justify-center items-center z-50">
          <div className="w-16 h-3 bg-slate-800 rounded-b-xl" />
        </div>

        {/* Outer content padding */}
        <div id="phone-content-pad" className={`flex-1 flex flex-col pt-6 px-4 ${theme.bgClass} overflow-hidden relative transition-colors duration-300`}>
          
          {/* MENU State View */}
          {gameState === 'MENU' && (
            <GameMenu
              currentTheme={theme}
              onSelectTheme={setThemeId}
              onStartGame={handleStartGame}
              highScores={highScores}
              onClearScores={handleClearScores}
              soundState={soundOn}
              onSoundToggle={() => setSoundOn((s) => !s)}
            />
          )}

          {/* ACTIVE PLAYING SCREEN */}
          {gameState === 'PLAYING' && (
            <div id="playing-state-view" className="flex-1 flex flex-col gap-3 h-full overflow-hidden justify-between">
              
              {/* Header HUD */}
              <GameHeader
                player={player}
                theme={theme}
                isPaused={isPaused}
                onPauseToggle={() => setIsPaused((p) => !p)}
                onBackToMenu={() => {
                  if (confirm('Exit your current game? All progress on this level will be lost.')) {
                    setGameState('MENU');
                  }
                }}
                onShowHelp={() => setGameState('HOW_TO_PLAY')}
                soundState={soundOn}
                onSoundToggle={() => setSoundOn((s) => !s)}
              />

              {/* Game Board Maze Grid */}
              <GameBoard
                grid={grid}
                theme={theme}
                playerX={player.x}
                playerY={player.y}
                treasureX={treasureX}
                treasureY={treasureY}
                enemies={enemies}
                radarActive={radarActive}
                freezeActive={freezeActive}
                activePowerup={activePowerup}
                onCellClick={handleCellClick}
                shortestPath={shortestPath}
              />

              {/* Game Control D-Pad or Action Overlay */}
              <Controls
                theme={theme}
                inventory={inventory}
                activePowerup={activePowerup}
                onMove={handlePlayerMove}
                onUsePowerup={handleUsePowerup}
                radarActive={radarActive}
                freezeActive={freezeActive}
              />

              {/* Pause Overlay banner */}
              {isPaused && (
                <div id="paused-screen-overlay" className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-4 z-30">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 animate-pulse" id="pause-icon-wrap">
                    <Info size={32} id="icon-pause-overlay" />
                  </div>
                  <h2 className="text-xl font-black font-mono text-yellow-400 uppercase tracking-widest">GAME PAUSED</h2>
                  <p className="text-xs text-white/40 font-mono">Tap D-pad or ESC to resume</p>
                  
                  <button
                    id="btn-resume-overlay"
                    onClick={() => setIsPaused(false)}
                    className="mt-4 px-6 py-2 rounded-xl bg-yellow-500 text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer"
                  >
                    Resume Quest
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SHOP State View */}
          {gameState === 'SHOP' && (
            <ShopModal
              coins={player.coins}
              inventory={inventory}
              theme={theme}
              onBuy={handlePurchasePowerup}
              onClose={() => setGameState('LEVEL_COMPLETE')}
            />
          )}

          {/* LEVEL COMPLETE STATE */}
          {gameState === 'LEVEL_COMPLETE' && (
            <LevelCompleteModal
              player={player}
              theme={theme}
              levelCoinsCollected={levelCoinsCollected}
              levelBonusScore={levelBonusScore}
              onNextLevel={handleNextLevel}
              onOpenShop={() => setGameState('SHOP')}
            />
          )}

          {/* GAME OVER STATE */}
          {gameState === 'GAME_OVER' && (
            <div id="game-over-view" className="flex-1 flex flex-col items-center justify-center gap-5 text-center animate-fade-in my-auto">
              <div id="game-over-icon-box" className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
                <Skull size={44} id="icon-game-over-skull" />
              </div>

              <div id="game-over-headers">
                <h2 className="text-3xl font-black font-mono text-red-500 tracking-tight leading-none">QUEST FAILED</h2>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest mt-1">Stamina Depleted</p>
              </div>

              {/* Score summary panel */}
              <div id="game-over-stats" className="w-full max-w-[260px] bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between" id="go-stat-level">
                  <span className="text-white/40">Reached Level</span>
                  <span className="text-white font-bold">{player.level}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2" id="go-stat-score">
                  <span className="text-white/40">Final Score</span>
                  <span className="text-yellow-400 font-bold text-sm">{player.score}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2" id="go-stat-coins">
                  <span className="text-white/40">Coins Balance</span>
                  <span className="text-amber-400 font-bold">{player.coins}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div id="game-over-actions" className="flex flex-col gap-2.5 w-full max-w-[260px] mt-2">
                <button
                  id="btn-go-retry"
                  onClick={handleStartGame}
                  className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <RotateCcw size={14} id="icon-go-retry" />
                  <span>Try Again</span>
                </button>

                <button
                  id="btn-go-menu"
                  onClick={() => setGameState('MENU')}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs transition-all active:scale-[0.98]"
                >
                  Main Menu
                </button>
              </div>
            </div>
          )}

          {/* HELP SCREEN / DETAILS VIEW */}
          {gameState === 'HOW_TO_PLAY' && (
            <div id="help-screen-view" className="flex-1 flex flex-col gap-4 text-white overflow-y-auto font-sans py-4 my-auto">
              <div id="help-header" className="flex items-center gap-2">
                <Info size={20} className="text-indigo-400" id="icon-help-header" />
                <h2 className="text-lg font-black font-mono tracking-tight text-white leading-none">HOW TO CONQUER THE MAZE</h2>
              </div>

              <div id="help-steps-list" className="flex flex-col gap-3 font-mono text-[10px] text-white/80 leading-relaxed pr-1">
                <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex flex-col gap-1" id="help-sec-goal">
                  <span className="font-bold text-yellow-400 uppercase tracking-widest text-[9px]">1. Main Objective</span>
                  <p>Guide your hero (the emoji in the top-left) through corridors to touch the golden chest/trophy in the bottom-right corner.</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex flex-col gap-1" id="help-sec-hazards">
                  <span className="font-bold text-red-400 uppercase tracking-widest text-[9px]">2. Hazards & Danger</span>
                  <p>Later levels introduce spike traps and patrolling guards. Colliding with them consumes 1 Life. Taking damage activates temporary invincibility.</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex flex-col gap-1" id="help-sec-powerups">
                  <span className="font-bold text-cyan-400 uppercase tracking-widest text-[9px]">3. Power-up Secrets</span>
                  <p>Tap inventory triggers below the grid to unleash powers:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-white/60 text-[9px]" id="help-powerups-list">
                    <li><strong>Drill:</strong> Click Drill, then click/move to adjacent wall to smash block.</li>
                    <li><strong>Radar:</strong> Lights up the optimal escape path for 5 seconds.</li>
                    <li><strong>Time Dash:</strong> Speed injector adding +20s limit immediately.</li>
                    <li><strong>Shield:</strong> Full hazard barrier + spawns 1 Life back.</li>
                  </ul>
                </div>
              </div>

              <button
                id="btn-help-return"
                onClick={() => setGameState('PLAYING')}
                className="w-full mt-auto py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
              >
                Return to Adventure
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
