import {
  BUBBLE_COLORS,
  BUBBLE_DIAMETER,
  BUBBLE_RADIUS,
  GridBubble,
  LevelConfig,
  MAX_COLS,
  ROW_VERTICAL_SPACING,
  SpecialBubbleKind,
  BubbleColorName,
} from "./game-types";

const RANDOM_ID = () => Math.random().toString(36).slice(2, 9);

export type CellChar =
  | "."
  | "R"
  | "B"
  | "G"
  | "Y"
  | "P"
  | "O"
  | "C"
  | "K"
  | "X"
  | "W"
  | "!"
  | "F"
  | "A"
  | "?";

const COLOR_FROM_CHAR: Record<CellChar, BubbleColorName> = {
  ".": "red", // placeholder, unused
  R: "red",
  B: "blue",
  G: "green",
  Y: "yellow",
  P: "purple",
  O: "orange",
  C: "cyan",
  K: "pink",
  X: "gray",
  W: "cyan",
  "!": "red",
  F: "blue",
  A: "green",
  "?": "red",
};

const KIND_FROM_CHAR: Record<CellChar, SpecialBubbleKind> = {
  ".": "normal",
  R: "normal",
  B: "normal",
  G: "normal",
  Y: "normal",
  P: "normal",
  O: "normal",
  C: "normal",
  K: "normal",
  X: "obstacle",
  W: "rainbow",
  "!": "bomb",
  F: "freeze",
  A: "aim",
  "?": "normal",
};

export const getBubbleCoordinates = (row: number, col: number) => {
  const offset = (row % 2) * BUBBLE_RADIUS;
  const x = col * BUBBLE_DIAMETER + BUBBLE_RADIUS + offset;
  const y = row * ROW_VERTICAL_SPACING + BUBBLE_RADIUS;
  return { x, y };
};

export const charToBubble = (
  ch: CellChar,
  row: number,
  col: number,
  level: LevelConfig
): GridBubble | null => {
  if (ch === ".") {
    return null;
  }

  let color: BubbleColorName = COLOR_FROM_CHAR[ch];

  if (ch === "?") {
    color = level.bubbleColors[Math.floor(Math.random() * level.bubbleColors.length)];
  }

  if (ch === "W") {
    color = level.bubbleColors[Math.floor(Math.random() * level.bubbleColors.length)];
  }

  if (ch === "!" && level.bubbleColors.length) {
    color = level.bubbleColors[Math.floor(Math.random() * level.bubbleColors.length)];
  }

  const kind = KIND_FROM_CHAR[ch];
  const { x, y } = getBubbleCoordinates(row, col);

  return {
    id: `${row}-${col}-${RANDOM_ID()}`,
    row,
    col,
    x,
    y,
    color,
    kind,
    locked: kind === "obstacle",
  };
};

export const createInitialGrid = (level: LevelConfig) => {
  const grid: (GridBubble | null)[][] = [];
  level.initialRows.forEach((rowString, rowIndex) => {
    const row: (GridBubble | null)[] = [];
    for (let col = 0; col < MAX_COLS; col += 1) {
      const char = (rowString[col] || ".") as CellChar;
      const bubble = charToBubble(char, rowIndex, col, level);
      row.push(bubble);
    }
    grid.push(row);
  });
  return grid;
};

export const clampCol = (col: number) => Math.max(0, Math.min(MAX_COLS - 1, col));

export const ensureGridHeight = (grid: (GridBubble | null)[][], minRows: number) => {
  while (grid.length < minRows) {
    const emptyRow = new Array<GridBubble | null>(MAX_COLS).fill(null);
    grid.push(emptyRow);
  }
};

export const getNeighbors = (row: number, col: number) => {
  const offsets =
    row % 2 === 0
      ? [
          [0, -1],
          [0, 1],
          [-1, 0],
          [-1, -1],
          [1, 0],
          [1, -1],
        ]
      : [
          [0, -1],
          [0, 1],
          [-1, 0],
          [-1, 1],
          [1, 0],
          [1, 1],
        ];
  return offsets.map(([dr, dc]) => ({ row: row + dr, col: col + dc }));
};

export const inBounds = (row: number, col: number, grid: (GridBubble | null)[][]) =>
  row >= 0 && col >= 0 && row < grid.length && col < MAX_COLS;

export const isColorMatch = (bubble: GridBubble | null, color: BubbleColorName) => {
  if (!bubble) return false;
  if (bubble.kind === "rainbow") return true;
  return bubble.color === color;
};

export const cloneGrid = (grid: (GridBubble | null)[][]) =>
  grid.map((row) => row.map((cell) => (cell ? { ...cell } : null)));

export const getColorHex = (color: BubbleColorName) => BUBBLE_COLORS[color];
