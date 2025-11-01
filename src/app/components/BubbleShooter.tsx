"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActiveEffects,
  BUBBLE_DIAMETER,
  BUBBLE_RADIUS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GameStats,
  GridBubble,
  LevelConfig,
  MAX_COLS,
  MAX_LIVES,
  ROW_VERTICAL_SPACING,
  ShooterState,
  SpecialBubbleKind,
  BUBBLE_COLORS,
} from "@/lib/game-types";
import {
  createInitialGrid,
  getBubbleCoordinates,
  getColorHex,
  getNeighbors,
  inBounds,
  clampCol,
  ensureGridHeight,
} from "@/lib/grid";
import { LEVELS } from "@/lib/levels";

type GameStatus = "intro" | "playing" | "cleared" | "gameover" | "paused";

interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: keyof typeof BUBBLE_COLORS;
  kind: SpecialBubbleKind;
}

const SHOOTER_ORIGIN = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT - BUBBLE_RADIUS - 20,
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;
const MIN_ANGLE = toRadians(20);
const MAX_ANGLE = toRadians(160);

const SHOT_SPEED = 720; // pixels per second
const SPEED_BURST_MULTIPLIER = 1.4;

const RANDOM_ID = () => Math.random().toString(36).slice(2, 10);

const generateBubbleForShooter = (level: LevelConfig): GridBubble => {
  const rand = Math.random();
  const powerRates = level.powerUpRates ?? {};
  let remaining = rand;
  const pickKind = (rate = 0) => {
    if (rate <= 0) return false;
    if (remaining < rate) return true;
    remaining -= rate;
    return false;
  };

  let kind: SpecialBubbleKind = "normal";

  if (pickKind(powerRates.bomb)) {
    kind = "bomb";
  } else if (pickKind(powerRates.rainbow)) {
    kind = "rainbow";
  } else if (pickKind(powerRates.freeze)) {
    kind = "freeze";
  } else if (pickKind(powerRates.aim)) {
    kind = "aim";
  }

  const color = level.bubbleColors[Math.floor(Math.random() * level.bubbleColors.length)];

  return {
    id: `shooter-${RANDOM_ID()}`,
    row: -1,
    col: -1,
    x: SHOOTER_ORIGIN.x,
    y: SHOOTER_ORIGIN.y,
    color,
    kind,
  };
};

const updateBubblePositionMetadata = (grid: (GridBubble | null)[][]) => {
  grid.forEach((row, rowIndex) => {
    row.forEach((bubble, colIndex) => {
      if (bubble) {
        bubble.row = rowIndex;
        bubble.col = colIndex;
        const { x, y } = getBubbleCoordinates(rowIndex, colIndex);
        bubble.x = x;
        bubble.y = y;
      }
    });
  });
};

const findMatches = (
  grid: (GridBubble | null)[][],
  startRow: number,
  startCol: number
) => {
  const start = grid[startRow]?.[startCol];
  if (!start || start.kind === "obstacle") return [];

  const targetColor = start.kind === "rainbow" ? start.color : start.color;
  const visited = new Set<string>();
  const toVisit = [{ row: startRow, col: startCol }];
  const matches: GridBubble[] = [];

  while (toVisit.length) {
    const next = toVisit.pop();
    if (!next) continue;
    const key = `${next.row}-${next.col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (!inBounds(next.row, next.col, grid)) continue;
    const bubble = grid[next.row][next.col];
    if (!bubble) continue;

    const isMatch =
      bubble.kind === "rainbow" ||
      bubble.color === targetColor ||
      (start.kind === "rainbow" && bubble.color === start.color);

    if (!isMatch) continue;

    matches.push(bubble);

    const neighbors = getNeighbors(next.row, next.col);
    neighbors.forEach((n) => {
      if (inBounds(n.row, n.col, grid)) {
        toVisit.push(n);
      }
    });
  }

  return matches;
};

const removeFloatingClusters = (grid: (GridBubble | null)[][]) => {
  const visited = new Set<string>();
  const stack: { row: number; col: number }[] = [];

  grid[0]?.forEach((bubble, col) => {
    if (bubble && bubble.kind !== "obstacle") {
      stack.push({ row: 0, col });
    }
  });

  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    const key = `${node.row}-${node.col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const bubble = grid[node.row]?.[node.col];
    if (!bubble || bubble.kind === "obstacle") continue;

    const neighbors = getNeighbors(node.row, node.col);
    neighbors.forEach((n) => {
      if (inBounds(n.row, n.col, grid)) {
        const nb = grid[n.row][n.col];
        if (nb && nb.kind !== "obstacle") {
          stack.push(n);
        }
      }
    });
  }

  const removed: GridBubble[] = [];

  grid.forEach((row, rowIndex) => {
    row.forEach((bubble, colIndex) => {
      if (!bubble) return;
      if (bubble.kind === "obstacle") return;
      const key = `${rowIndex}-${colIndex}`;
      if (!visited.has(key)) {
        removed.push(bubble);
        row[colIndex] = null;
      }
    });
  });

  return removed;
};

const generateRandomRow = (
  level: LevelConfig,
  includeObstacle = false
): (GridBubble | null)[] => {
  const row: (GridBubble | null)[] = new Array(MAX_COLS).fill(null);
  for (let col = 0; col < MAX_COLS; col += 1) {
    if (Math.random() < 0.2) continue;
    const kindChance = Math.random();
    let kind: SpecialBubbleKind = "normal";
    if (includeObstacle && kindChance < 0.1 && level.features?.hasObstacles) {
      kind = "obstacle";
    } else if (level.powerUpRates?.rainbow && kindChance < (level.powerUpRates?.rainbow ?? 0) / 2) {
      kind = "rainbow";
    }
    const color =
      kind === "obstacle"
        ? "gray"
        : level.bubbleColors[Math.floor(Math.random() * level.bubbleColors.length)];
    const bubble: GridBubble = {
      id: `row-${RANDOM_ID()}`,
      row: 0,
      col,
      x: 0,
      y: 0,
      color,
      kind,
      locked: kind === "obstacle",
    };
    row[col] = bubble;
  }
  return row;
};

const hasRemainingBubbles = (grid: (GridBubble | null)[][]) =>
  grid.some((row) =>
    row.some((cell) => cell && cell.kind !== "obstacle")
  );

const aimLinePoints = (
  angle: number,
  maxLength: number,
  wallBounds: { left: number; right: number }
) => {
  const points: { x: number; y: number }[] = [];
  const dx = Math.cos(angle);
  const dy = -Math.sin(angle);
  let x = SHOOTER_ORIGIN.x;
  let y = SHOOTER_ORIGIN.y;
  let remaining = maxLength;
  const segmentLength = 24;

  while (remaining > 0) {
    const nx = x + dx * segmentLength;
    const ny = y + dy * segmentLength;
    if (nx <= wallBounds.left + BUBBLE_RADIUS || nx >= wallBounds.right - BUBBLE_RADIUS) {
      const reflectAngle = Math.PI - angle;
      angle = reflectAngle;
      points.push({ x: nx, y: ny });
      x = nx;
      y = ny;
    } else if (ny <= BUBBLE_RADIUS) {
      points.push({ x: nx, y: BUBBLE_RADIUS });
      break;
    } else {
      points.push({ x: nx, y: ny });
      x = nx;
      y = ny;
    }
    remaining -= segmentLength;
  }

  return points;
};

const BubbleShooter = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>("intro");
  const [lives, setLives] = useState(MAX_LIVES);
  const shotsSinceDropRef = useRef(0);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combos: 0,
    totalPopped: 0,
    starsEarned: 0,
  });
  const [effects, setEffects] = useState<ActiveEffects>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [shooter, setShooter] = useState<ShooterState>(() => ({
    angle: Math.PI / 2,
    current: undefined,
    next: undefined,
  }));
  const [speedBurst, setSpeedBurst] = useState(false);
  const [timeSnapshot, setTimeSnapshot] = useState(() => Date.now());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef<(GridBubble | null)[][]>(createInitialGrid(LEVELS[0]));
  const projectileRef = useRef<Projectile | null>(null);
  const fireCurrentBubbleRef = useRef<() => void>(() => {});
  const lastTimestampRef = useRef<number>(0);
  const wallOffsetRef = useRef(0);
  const lastDescentRef = useRef<number>(0);

  const level = LEVELS[levelIndex];

  const resetLevelState = useCallback(
    (newLevel: LevelConfig) => {
      const baseGrid = createInitialGrid(newLevel);
      ensureGridHeight(baseGrid, 12);
      updateBubblePositionMetadata(baseGrid);
      gridRef.current = baseGrid;
      setStats((prev) => ({
        ...prev,
        combos: 0,
      }));
      shotsSinceDropRef.current = 0;
      setEffects({});
      setSpeedBurst(false);
      setTimeRemaining(newLevel.timeLimitSeconds ?? null);
      const initialShooter = generateBubbleForShooter(newLevel);
      const nextShooter = generateBubbleForShooter(newLevel);
      setShooter({
        angle: Math.PI / 2,
        current: initialShooter,
        next: nextShooter,
      });
      projectileRef.current = null;
      lastDescentRef.current = Date.now();
      setStatus("playing");
    },
    []
  );

  useEffect(() => {
    startTransition(() => {
      resetLevelState(level);
    });
  }, [level, resetLevelState]);

  const advanceLevel = useCallback(() => {
    if (levelIndex === LEVELS.length - 1) {
      setStatus("cleared");
      return;
    }
    setLevelIndex((idx) => idx + 1);
    setLives(MAX_LIVES);
  }, [levelIndex]);

  const loseLife = useCallback(() => {
    setLives((prev) => {
      if (prev <= 1) {
        setStatus("gameover");
        return 0;
      }
      return prev - 1;
    });
    resetLevelState(level);
  }, [level, resetLevelState]);

  const applyBombEffect = useCallback(
    (row: number, col: number) => {
      const grid = gridRef.current;
      const affected: GridBubble[] = [];
      for (let r = row - 1; r <= row + 1; r += 1) {
        for (let c = col - 1; c <= col + 1; c += 1) {
          if (!inBounds(r, c, grid)) continue;
          const bubble = grid[r][c];
          if (!bubble) continue;
          if (bubble.kind === "obstacle") continue;
          affected.push(bubble);
          grid[r][c] = null;
        }
      }
      if (affected.length) {
        setStats((prev) => ({
          ...prev,
          score: prev.score + affected.length * 25,
          combos: prev.combos + 1,
          totalPopped: prev.totalPopped + affected.length,
        }));
      }
    },
    []
  );

  const handlePlacementResolution = useCallback(
    (row: number, col: number) => {
      const grid = gridRef.current;
      const bubble = grid[row][col];
      if (!bubble) return;

      const matches = findMatches(grid, row, col);
      if (matches.length >= 3) {
        matches.forEach((item) => {
          if (grid[item.row]?.[item.col]) {
            grid[item.row][item.col] = null;
          }
        });
        setStats((prev) => {
          const comboMultiplier = Math.min(prev.combos + 1, 5);
          const gained = matches.length * 50 * comboMultiplier;
          return {
            ...prev,
            score: prev.score + gained,
            combos: prev.combos + 1,
            totalPopped: prev.totalPopped + matches.length,
          };
        });
      } else {
        setStats((prev) => ({
          ...prev,
          combos: 0,
        }));
      }

      if (bubble.kind === "bomb") {
        applyBombEffect(row, col);
      }

      const floating = removeFloatingClusters(grid);
      if (floating.length) {
        setStats((prev) => ({
          ...prev,
          score: prev.score + floating.length * 75,
          totalPopped: prev.totalPopped + floating.length,
          combos: prev.combos + 1,
        }));
      }

      if (bubble.kind === "freeze") {
        setEffects((prev) => ({
          ...prev,
          freezeUntil: Date.now() + 5000,
        }));
      }

      if (bubble.kind === "aim") {
        setEffects((prev) => ({
          ...prev,
          aimAssistUntil: Date.now() + 7000,
        }));
      }

      if (!hasRemainingBubbles(grid)) {
        const bonus = 1000 + Math.max(timeRemaining ?? 0, 0) * 10;
        setStats((prev) => ({
          ...prev,
          score: prev.score + bonus,
          starsEarned: prev.starsEarned + 3,
        }));
        setStatus("cleared");
        setTimeout(() => advanceLevel(), 1200);
      }
    },
    [advanceLevel, applyBombEffect, timeRemaining]
  );

  const placeBubbleOnGrid = useCallback(
    (projectile: Projectile) => {
      const grid = gridRef.current;
      let row = Math.round((projectile.y - BUBBLE_RADIUS) / ROW_VERTICAL_SPACING);
      row = Math.max(0, row);

      let colBase = (projectile.x - BUBBLE_RADIUS) / BUBBLE_DIAMETER;
      if (row % 2 === 1) {
        colBase = (projectile.x - BUBBLE_RADIUS * 2) / BUBBLE_DIAMETER;
      }
      let col = Math.round(colBase);
      col = clampCol(col);

      ensureGridHeight(grid, row + 2);

      const existing = grid[row][col];
      if (existing) {
        const neighbors = getNeighbors(row, col);
        const openSpot = neighbors.find(
          (spot) => inBounds(spot.row, spot.col, grid) && !grid[spot.row][spot.col]
        );
        if (openSpot) {
          row = openSpot.row;
          col = openSpot.col;
        } else {
          row += 1;
          if (row >= grid.length) {
            grid.push(new Array(MAX_COLS).fill(null));
          }
        }
      }

      const { x, y } = getBubbleCoordinates(row, col);
      const newBubble: GridBubble = {
        id: projectile.id,
        row,
        col,
        x,
        y,
        color: projectile.kind === "obstacle" ? "gray" : projectile.color,
        kind: projectile.kind,
      };
      grid[row][col] = newBubble;
      handlePlacementResolution(row, col);

      if (row * ROW_VERTICAL_SPACING + BUBBLE_RADIUS * 2 >= CANVAS_HEIGHT - 160) {
        loseLife();
      }
    },
    [handlePlacementResolution, loseLife]
  );

  const applyDescent = useCallback(
    (force = false) => {
      const now = Date.now();
      const freezeActive = effects.freezeUntil && effects.freezeUntil > now;
      if (freezeActive && !force) return;

      const grid = gridRef.current;
      for (let row = grid.length - 1; row >= 0; row -= 1) {
        const newRow = grid[row];
        if (!newRow) continue;
        grid[row + 1] = newRow;
        grid[row] = new Array(MAX_COLS).fill(null);
      }
      grid[0] = generateRandomRow(level, level.features?.hasObstacles ?? false);
      updateBubblePositionMetadata(grid);
      lastDescentRef.current = now;

      const deepest = grid.length * ROW_VERTICAL_SPACING;
      if (deepest >= CANVAS_HEIGHT - 120) {
        loseLife();
      }
    },
    [effects.freezeUntil, level, loseLife]
  );

  const handlePostShot = useCallback(
    (shotCount: number) => {
      if (shotCount % level.descentEveryShots === 0) {
        applyDescent();
        return;
      }

      if (level.randomBubbleChance && Math.random() < level.randomBubbleChance) {
        const grid = gridRef.current;
        const topRow = grid[0];
        if (topRow) {
          const emptyIndices = topRow
            .map((cell, idx) => (cell ? null : idx))
            .filter((idx) => idx !== null) as number[];
          if (emptyIndices.length) {
            const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            const color =
              level.bubbleColors[Math.floor(Math.random() * level.bubbleColors.length)];
            const newBubble: GridBubble = {
              id: `drop-${RANDOM_ID()}`,
              row: 0,
              col: idx,
              color,
              kind: "normal",
              x: 0,
              y: 0,
            };
            const coords = getBubbleCoordinates(0, idx);
            newBubble.x = coords.x;
            newBubble.y = coords.y;
            topRow[idx] = newBubble;
          }
        }
      }
    },
    [applyDescent, level]
  );

  const fireCurrentBubble = useCallback(() => {
    fireCurrentBubbleRef.current();
  }, []);

  useEffect(() => {
    fireCurrentBubbleRef.current = () => {
      if (!shooter.current) return;
      if (projectileRef.current) return;

      const angle = Math.min(
        MAX_ANGLE,
        Math.max(MIN_ANGLE, shooter.angle)
      );

      const multiplier = speedBurst ? SPEED_BURST_MULTIPLIER : 1;

      const projectile: Projectile = {
        id: shooter.current.id,
        x: SHOOTER_ORIGIN.x,
        y: SHOOTER_ORIGIN.y,
        vx: Math.cos(angle) * SHOT_SPEED * multiplier,
        vy: -Math.sin(angle) * SHOT_SPEED * multiplier,
        color: shooter.current.kind === "obstacle" ? "gray" : shooter.current.color,
        kind: shooter.current.kind,
      };

      projectileRef.current = projectile;
      setShooter((prev) => ({
        angle: prev.angle,
        current: prev.next,
        next: generateBubbleForShooter(level),
      }));

      const updated = shotsSinceDropRef.current + 1;
      shotsSinceDropRef.current = updated;
      handlePostShot(updated);
    };
  }, [handlePostShot, level, shooter, speedBurst]);

  useEffect(() => {
    if (status !== "playing") return;
    if (!level.timeLimitSeconds) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          loseLife();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [level.timeLimitSeconds, loseLife, status]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSnapshot(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    if (!level.features?.movingRows) return;
    const interval = setInterval(() => {
      const grid = gridRef.current;
      for (let i = 0; i < grid.length; i += 1) {
        const row = grid[i];
        if (i % 2 === 0) {
          row.unshift(row.pop() ?? null);
        } else {
          row.push(row.shift() ?? null);
        }
      }
      updateBubblePositionMetadata(grid);
    }, 5000);
    return () => clearInterval(interval);
  }, [level.features?.movingRows, status]);

  useEffect(() => {
    if (status !== "playing") return;
    if (!level.features?.speedBursts) return;
    const interval = setInterval(() => {
      setSpeedBurst(true);
      setTimeout(() => setSpeedBurst(false), 4000);
    }, 14000);
    return () => clearInterval(interval);
  }, [level.features?.speedBursts, status]);

  useEffect(() => {
    if (status !== "playing") {
      return;
    }
    const handlePointerMove = (event: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dx = x - SHOOTER_ORIGIN.x;
      const dy = SHOOTER_ORIGIN.y - y;
      let angle = Math.atan2(dy, dx);
      if (angle < MIN_ANGLE) angle = MIN_ANGLE;
      if (angle > MAX_ANGLE) angle = MAX_ANGLE;
      setShooter((prev) => ({
        ...prev,
        angle,
      }));
    };
    const handlePointerDown = () => {
      fireCurrentBubble();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        fireCurrentBubble();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fireCurrentBubble, status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame: number;

    const render = (timestamp: number) => {
      const ctx = context;
      const delta = (timestamp - lastTimestampRef.current) / 1000 || 0;
      lastTimestampRef.current = timestamp;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#1e293b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (projectileRef.current) {
        const projectile = projectileRef.current;
        projectile.x += projectile.vx * delta;
        projectile.y += projectile.vy * delta;

        const leftWall =
          BUBBLE_RADIUS + wallOffsetRef.current * (level.features?.movingWalls ? 1 : 0);
        const rightWall =
          CANVAS_WIDTH -
          BUBBLE_RADIUS -
          wallOffsetRef.current * (level.features?.movingWalls ? 1 : 0);

        if (projectile.x <= leftWall) {
          projectile.x = leftWall;
          projectile.vx *= -1;
        } else if (projectile.x >= rightWall) {
          projectile.x = rightWall;
          projectile.vx *= -1;
        }
        if (projectile.y <= BUBBLE_RADIUS) {
          placeBubbleOnGrid(projectile);
          projectileRef.current = null;
        } else {
          const grid = gridRef.current;
          outer: for (let row = 0; row < grid.length; row += 1) {
            for (let col = 0; col < MAX_COLS; col += 1) {
              const bubble = grid[row]?.[col];
              if (!bubble) continue;
              const dx = projectile.x - bubble.x;
              const dy = projectile.y - bubble.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance <= BUBBLE_DIAMETER * 0.52) {
                placeBubbleOnGrid(projectile);
                projectileRef.current = null;
                break outer;
              }
            }
          }
        }
      }

      const grid = gridRef.current;
      ensureGridHeight(grid, 16);

      grid.forEach((row, rowIndex) => {
        row.forEach((bubble) => {
          if (!bubble) return;
          const { x, y } = getBubbleCoordinates(rowIndex, bubble.col);
          bubble.x = x;
          bubble.y = y;
          ctx.beginPath();
          const baseColor =
            bubble.kind === "obstacle"
              ? "#1f2937"
              : bubble.kind === "rainbow"
              ? ctx.createRadialGradient(x, y, 4, x, y, BUBBLE_RADIUS)
              : getColorHex(bubble.color);

          if (typeof baseColor !== "string") {
            baseColor.addColorStop(0, "#ffffff");
            baseColor.addColorStop(0.5, BUBBLE_COLORS[bubble.color]);
            baseColor.addColorStop(1, "#0f172a");
            ctx.fillStyle = baseColor;
          } else {
            const grad = ctx.createRadialGradient(x - 8, y - 8, 4, x, y, BUBBLE_RADIUS);
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(0.4, baseColor);
            grad.addColorStop(1, "#0f172a");
            ctx.fillStyle = grad;
          }
          ctx.arc(x, y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(15,23,42,0.35)";
          ctx.stroke();

          if (bubble.kind === "bomb") {
            ctx.fillStyle = "rgba(239,68,68,0.8)";
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
          }
          if (bubble.kind === "freeze") {
            ctx.fillStyle = "rgba(14,165,233,0.75)";
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
          }
          if (bubble.kind === "aim") {
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 8, y);
            ctx.lineTo(x + 8, y);
            ctx.stroke();
          }
        });
      });

      if (projectileRef.current) {
        const projectile = projectileRef.current;
        const gradientProjectile = ctx.createRadialGradient(
          projectile.x,
          projectile.y,
          4,
          projectile.x,
          projectile.y,
          BUBBLE_RADIUS
        );
        gradientProjectile.addColorStop(0, "#ffffff");
        gradientProjectile.addColorStop(0.5, getColorHex(projectile.color));
        gradientProjectile.addColorStop(1, "#0f172a");
        ctx.fillStyle = gradientProjectile;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(30,41,59,0.75)";
      ctx.beginPath();
      ctx.arc(SHOOTER_ORIGIN.x, SHOOTER_ORIGIN.y + 12, 38, Math.PI, 0);
      ctx.fill();

      const barrelLength = 56;
      const dx = Math.cos(shooter.angle) * barrelLength;
      const dy = Math.sin(shooter.angle) * barrelLength;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(SHOOTER_ORIGIN.x, SHOOTER_ORIGIN.y);
      ctx.lineTo(SHOOTER_ORIGIN.x + dx, SHOOTER_ORIGIN.y - dy);
      ctx.stroke();

      if (shooter.current) {
        ctx.fillStyle = getColorHex(shooter.current.color);
        ctx.beginPath();
        ctx.arc(SHOOTER_ORIGIN.x, SHOOTER_ORIGIN.y, BUBBLE_RADIUS - 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (shooter.next) {
        ctx.fillStyle = getColorHex(shooter.next.color);
        ctx.beginPath();
        ctx.arc(SHOOTER_ORIGIN.x + 70, SHOOTER_ORIGIN.y + 50, BUBBLE_RADIUS - 6, 0, Math.PI * 2);
        ctx.fill();
      }

      const aimActive =
        (effects.aimAssistUntil && effects.aimAssistUntil > Date.now()) ||
        level.features?.reducedAim === false;
      if (aimActive || !level.features?.reducedAim) {
        const wallBounds = {
          left: BUBBLE_RADIUS + (level.features?.movingWalls ? wallOffsetRef.current : 0),
          right:
            CANVAS_WIDTH -
            BUBBLE_RADIUS -
            (level.features?.movingWalls ? wallOffsetRef.current : 0),
        };
        const length = level.features?.reducedAim ? 260 : 420;
        const points = aimLinePoints(shooter.angle, length, wallBounds);
        ctx.setLineDash([8, 10]);
        ctx.strokeStyle = "rgba(148,163,184,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(SHOOTER_ORIGIN.x, SHOOTER_ORIGIN.y);
        points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (level.features?.movingWalls) {
        wallOffsetRef.current = Math.sin(timestamp / 1000) * 40;
        ctx.fillStyle = "rgba(30,41,59,0.5)";
        ctx.fillRect(0, 0, BUBBLE_RADIUS + wallOffsetRef.current, CANVAS_HEIGHT);
        ctx.fillRect(
          CANVAS_WIDTH - BUBBLE_RADIUS - wallOffsetRef.current,
          0,
          BUBBLE_RADIUS + wallOffsetRef.current,
          CANVAS_HEIGHT
        );
      }

      if (level.descentIntervalMs && level.features?.constantDescent) {
        if (Date.now() - lastDescentRef.current > level.descentIntervalMs) {
          applyDescent(true);
        }
      }

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrame);
  }, [
    applyDescent,
    effects.aimAssistUntil,
    level.descentIntervalMs,
    level.features?.constantDescent,
    level.features?.movingWalls,
    level.features?.reducedAim,
    placeBubbleOnGrid,
    shooter,
  ]);

  const hudStats = useMemo(() => {
    const progress = ((levelIndex + 1) / LEVELS.length) * 100;
    return {
      progress,
    };
  }, [levelIndex]);

  return (
    <div className="flex flex-col gap-6 px-6 py-10 text-slate-100">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-blue-950/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Color Burst: 20-Level Bubble Shooter
            </h1>
            <p className="text-sm text-slate-300">
              Level {level.id}: {level.title} — {level.difficulty}
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm uppercase tracking-wide text-slate-300">
            <div>
              <span className="block text-xs text-slate-400">Score</span>
              <span className="text-lg font-semibold text-emerald-300">
                {stats.score.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-400">Combos</span>
              <span className="text-lg font-semibold text-sky-300">
                {stats.combos}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-400">Lives</span>
              <span className="text-lg font-semibold text-rose-300">
                {"❤".repeat(lives) || "—"}
              </span>
            </div>
            <div>
              <span className="block text-xs text-slate-400">Bubbles</span>
              <span className="text-lg font-semibold text-indigo-300">
                {stats.totalPopped}
              </span>
            </div>
            {timeRemaining !== null && (
              <div>
                <span className="block text-xs text-slate-400">Timer</span>
                <span className="text-lg font-semibold text-amber-300">
                  {timeRemaining}s
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-fuchsia-500 transition-all"
            style={{ width: `${hudStats.progress}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-white/10 px-3 py-1">
            Colors: {level.bubbleColors.length}
          </span>
          {level.features?.hasObstacles && (
            <span className="rounded-full border border-white/10 px-3 py-1">
              Gray obstacles active
            </span>
          )}
          {level.features?.movingRows && (
            <span className="rounded-full border border-white/10 px-3 py-1">
              Moving rows
            </span>
          )}
          {level.features?.movingWalls && (
            <span className="rounded-full border border-white/10 px-3 py-1">
              Wall bounce challenge
            </span>
          )}
          {level.features?.timeAttack && (
            <span className="rounded-full border border-white/10 px-3 py-1">
              Time attack
            </span>
          )}
          {speedBurst && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-emerald-300">
              Speed burst active
            </span>
          )}
          {effects.freezeUntil && effects.freezeUntil > timeSnapshot && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-sky-300">
              Freeze engaged
            </span>
          )}
          {effects.aimAssistUntil && effects.aimAssistUntil > timeSnapshot && (
            <span className="rounded-full border border-white/10 px-3 py-1 text-purple-300">
              Aim assist
            </span>
          )}
        </div>
      </div>
      <div className="mx-auto rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-blue-950/50">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="rounded-2xl border border-white/10 shadow-inner shadow-blue-950/50"
        />
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-200">
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-200">
            ⓘ
          </span>
          <span>
            Aim with your mouse or touch, click (or press space) to fire. Clear all bubbles to
            advance.
          </span>
        </div>
        <div className="flex grow flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Power-ups
          </span>
          <div className="flex flex-wrap gap-3 text-slate-200">
            <span>💣 Bomb clears surrounding bubbles</span>
            <span>🌈 Rainbow matches any color</span>
            <span>❄️ Freeze slows descent</span>
            <span>🎯 Aim boost extends guide</span>
          </div>
        </div>
      </div>
      {status === "gameover" && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="flex max-w-lg flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/90 p-10 text-center shadow-2xl shadow-blue-950/70">
            <h2 className="text-3xl font-semibold text-white">Game Over</h2>
            <p className="text-slate-300">
              You made it to level {level.id}. Total score: {stats.score.toLocaleString()} — popped{" "}
              {stats.totalPopped} bubbles!
            </p>
            <button
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
              onClick={() => {
                setLevelIndex(0);
                setLives(MAX_LIVES);
                resetLevelState(LEVELS[0]);
                setStats({
                  score: 0,
                  combos: 0,
                  totalPopped: 0,
                  starsEarned: 0,
                });
                setStatus("playing");
              }}
            >
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BubbleShooter;
