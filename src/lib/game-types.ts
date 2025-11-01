export const BUBBLE_COLORS = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#fb923c",
  cyan: "#22d3ee",
  pink: "#f472b6",
  gray: "#4b5563",
} as const;

export type BubbleColorName = keyof typeof BUBBLE_COLORS;

export type SpecialBubbleKind = "normal" | "bomb" | "rainbow" | "freeze" | "aim" | "obstacle";

export interface GridBubble {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  color: BubbleColorName;
  kind: SpecialBubbleKind;
  locked?: boolean;
}

export interface LevelFeatureFlags {
  movingRows?: boolean;
  randomColorBursts?: boolean;
  timeAttack?: boolean;
  hasObstacles?: boolean;
  movingWalls?: boolean;
  doubleLayer?: boolean;
  speedBursts?: boolean;
  reducedAim?: boolean;
  constantDescent?: boolean;
}

export interface LevelConfig {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Very Hard" | "Expert";
  bubbleColors: BubbleColorName[];
  initialRows: string[];
  descentEveryShots: number;
  descentIntervalMs?: number;
  randomBubbleChance?: number;
  powerUpRates?: {
    bomb?: number;
    rainbow?: number;
    freeze?: number;
    aim?: number;
  };
  timeLimitSeconds?: number;
  features?: LevelFeatureFlags;
}

export interface GameStats {
  score: number;
  combos: number;
  totalPopped: number;
  starsEarned: number;
}

export interface ActiveEffects {
  freezeUntil?: number;
  aimAssistUntil?: number;
}

export interface ShooterState {
  angle: number;
  current?: GridBubble;
  next?: GridBubble;
}

export const MAX_LIVES = 3;
export const CANVAS_WIDTH = 760;
export const CANVAS_HEIGHT = 960;
export const BUBBLE_RADIUS = 24;
export const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
export const ROW_VERTICAL_SPACING = BUBBLE_RADIUS * Math.sqrt(3);
export const MAX_COLS = 12;
