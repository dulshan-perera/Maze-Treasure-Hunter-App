import { Cell, PowerUpType } from '../types';

/**
 * Generates a perfect maze of size width x height (must be odd numbers)
 * using the Randomized Depth-First Search algorithm.
 */
export function generateMaze(width: number, height: number, level: number): {
  grid: Cell[][];
  startX: number;
  startY: number;
  treasureX: number;
  treasureY: number;
} {
  // Ensure dimensions are odd
  const w = width % 2 === 0 ? width + 1 : width;
  const h = height % 2 === 0 ? height + 1 : height;

  // 1. Initialize grid with all walls
  const grid: Cell[][] = Array(h)
    .fill(null)
    .map((_, y) =>
      Array(w)
        .fill(null)
        .map((_, x) => ({
          x,
          y,
          isWall: true,
          hasCoin: false,
          hasPowerup: null,
          hasTreasure: false,
          hasSpikes: false,
          spikesActive: false,
        }))
    );

  // Helper to check valid unvisited cell
  const unvisitedCells: { x: number; y: number }[] = [];
  const visited = Array(h)
    .fill(null)
    .map(() => Array(w).fill(false));

  const startX = 1;
  const startY = 1;

  // Carve out maze pathways
  const stack: [number, number][] = [];
  let current: [number, number] = [startX, startY];
  visited[startY][startX] = true;
  grid[startY][startX].isWall = false;

  while (true) {
    const [cx, cy] = current;
    const neighbors: [number, number, number, number][] = []; // [neighborX, neighborY, wallX, wallY]

    // Directions: Up, Right, Down, Left (jumping 2 spaces)
    const dirs = [
      [0, -2, 0, -1],
      [2, 0, 1, 0],
      [0, 2, 0, 1],
      [-2, 0, -1, 0],
    ];

    for (const [dx, dy, wx, wy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1) {
        if (!visited[ny][nx]) {
          neighbors.push([nx, ny, cx + wx, cy + wy]);
        }
      }
    }

    if (neighbors.length > 0) {
      // Pick random neighbor
      const [nx, ny, wx, wy] = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Carve through wall
      grid[wy][wx].isWall = false;
      grid[ny][nx].isWall = false;
      
      visited[ny][nx] = true;
      stack.push(current);
      current = [nx, ny];
    } else if (stack.length > 0) {
      current = stack.pop()!;
    } else {
      break;
    }
  }

  // 2. Set Treasure position - opposite corner or furthest path distance
  // For a reliable and challenging layout, let's place it at (w - 2, h - 2)
  const treasureX = w - 2;
  const treasureY = h - 2;
  grid[treasureY][treasureX].isWall = false;
  grid[treasureY][treasureX].hasTreasure = true;

  // Carve alternative random walls to create loops and shortcut powerups (especially for levels > 1)
  // This makes the maze slightly less linear and more fun
  const loopChance = Math.min(0.15, 0.02 * level); // Up to 15% chance to break walls
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (grid[y][x].isWall && (x % 2 === 0 || y % 2 === 0)) {
        // Count surrounding open cells
        let adjacentPaths = 0;
        if (!grid[y - 1][x].isWall) adjacentPaths++;
        if (!grid[y + 1][x].isWall) adjacentPaths++;
        if (!grid[y][x - 1].isWall) adjacentPaths++;
        if (!grid[y][x + 1].isWall) adjacentPaths++;

        if (adjacentPaths >= 2 && Math.random() < loopChance) {
          grid[y][x].isWall = false;
        }
      }
    }
  }

  // 3. Populate items (Coins, Powerups, Obstacles)
  const pathCells: { x: number; y: number }[] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      // Don't place anything on start position or treasure position
      if ((x === startX && y === startY) || (x === treasureX && y === treasureY)) {
        continue;
      }
      if (!grid[y][x].isWall) {
        pathCells.push({ x, y });
      }
    }
  }

  // Shuffle path cells
  const shuffledPaths = [...pathCells].sort(() => Math.random() - 0.5);

  // Coins density increases with levels (20% to 35% of paths)
  const coinRatio = Math.min(0.35, 0.18 + 0.02 * level);
  const coinCount = Math.floor(shuffledPaths.length * coinRatio);

  // Powerups density (around 3% to 6%)
  const powerupCount = Math.max(1, Math.floor(shuffledPaths.length * 0.04));
  const powerupTypes: PowerUpType[] = ['drill', 'radar', 'speed', 'freeze'];

  // Spikes (Traps) density (only for level 2+; up to 10%)
  const trapCount = level >= 2 ? Math.min(10, Math.floor(shuffledPaths.length * 0.05)) : 0;

  let index = 0;

  // Place traps
  for (let i = 0; i < trapCount && index < shuffledPaths.length; i++) {
    const cell = shuffledPaths[index++];
    grid[cell.y][cell.x].hasSpikes = true;
    grid[cell.y][cell.x].spikesActive = Math.random() > 0.5;
  }

  // Place power-ups
  for (let i = 0; i < powerupCount && index < shuffledPaths.length; i++) {
    const cell = shuffledPaths[index++];
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    grid[cell.y][cell.x].hasPowerup = type;
  }

  // Place coins
  for (let i = 0; i < coinCount && index < shuffledPaths.length; i++) {
    const cell = shuffledPaths[index++];
    // Don't overwrite if it has spikes or powerup
    if (!grid[cell.y][cell.x].hasPowerup && !grid[cell.y][cell.x].hasSpikes) {
      grid[cell.y][cell.x].hasCoin = true;
    }
  }

  return {
    grid,
    startX,
    startY,
    treasureX,
    treasureY,
  };
}

/**
 * BFS Pathfinding to find the shortest path from start to target.
 * Returns an array of coordinates representing the path.
 */
export function findShortestPath(
  grid: Cell[][],
  startX: number,
  startY: number,
  targetX: number,
  targetY: number
): { x: number; y: number }[] {
  const h = grid.length;
  const w = grid[0].length;
  
  const queue: [number, number, { x: number; y: number }[]][] = []; // [x, y, pathSoFar]
  const visited = Array(h)
    .fill(null)
    .map(() => Array(w).fill(false));

  queue.push([startX, startY, []]);
  visited[startY][startX] = true;

  while (queue.length > 0) {
    const [cx, cy, path] = queue.shift()!;

    if (cx === targetX && cy === targetY) {
      return path;
    }

    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        if (!grid[ny][nx].isWall && !visited[ny][nx]) {
          visited[ny][nx] = true;
          queue.push([nx, ny, [...path, { x: nx, y: ny }]]);
        }
      }
    }
  }

  return []; // No path found (should not happen in a perfect maze)
}
