import { LevelConfig } from "./game-types";

const TUTORIAL_ROWS = [
  "....RRGG....",
  "...RRRGGG...",
  "...GGBBRR...",
  "....GGRR....",
  ".....GG.....",
];

const EASY_PATTERN = [
  "...RRGGBB...",
  "..RRGGBBYY..",
  "..GGYYBBRR..",
  "...YYRRYY...",
  "....GGYY....",
];

const LIMITED_ANGLE_ROWS = [
  "..RRGGYYBB..",
  "..GGBBYYRR..",
  "..YYRRGGYY..",
  "...BBYYGG...",
  "...RRGGYY...",
  "....BBRR....",
];

const MEDIUM_CLUSTER_ROWS = [
  ".RRGGBBYYPP.",
  "RRGGBBYYPPGG",
  "GGBBYYPPRRCC",
  ".BBYYPPRRCC.",
  "..YYPPRRCC..",
  "...PPRRCC...",
];

const MOVING_ROW_BASE = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  ".PPOORRGGCC.",
];

const RANDOM_BURSTS_ROWS = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  ".OORRGGCCKK.",
];

const BONUS_ROWS = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  "OORRGGCCKKRR",
  ".RRGGCCKKRR.",
];

const DESCENT_ROWS = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  "OORRGGCCKKRR",
  "RRGGCCKKRROO",
];

const OBSTACLE_ROWS = [
  "RRXGGBBYYXPX",
  "GGBBYYXXOORR",
  "BBYYPPOXRGGG",
  "YYPPXXRRGGCC",
  "PPXXRRGGCCKK",
  "OORRGGXCKKRR",
  ".RRGGCCKKRR.",
];

const MULTI_PATTERN_ROWS = [
  "RRGGBBYYPPOO",
  "GGXBBYYPPOOR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGWCKK",
  "OORR!GCCKKRR",
  ".RRAGCCKKRR.",
];

const RAINBOW_INTRO_ROWS = [
  "RRGGBBYYPPOO",
  "GGWBBYYPPOOR",
  "BBWYPPOORRGG",
  "YYPPOORRGGCC",
  "PPWORRGGCCKK",
  "OORR!GCCKKRR",
  "RRAGGCCKKRRR",
];

const SPEED_ROWS = [
  "RRGGBBYYPPOO",
  "GGWBBYYPPOOR",
  "BBWYPPOORRGG",
  "YYPPOORRGGCC",
  "PPWORRGGCCKK",
  "OORR!GCCKKRR",
  "RRAGGCCKKRRR",
  "RRGGBBYYPPOO",
];

const WALLS_ROWS = [
  "XRRGGBBYYPPX",
  "XGGBBYYPPOOX",
  "XBBYYPPOORRX",
  "XYYPPOORRGGX",
  "XPPOORRGGCCX",
  "XOORRGGCCKKX",
  "XRRAGGCCKKRX",
];

const TIME_ATTACK_ROWS = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  "OORRGGCCKKRR",
  "RRAGGCCKKRRR",
  "!RRGGCCKKRR!",
];

const DOUBLE_LAYER_ROWS = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  "OORRGGCCKKRR",
  "RRAGGCCKKRRR",
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
];

const RANDOM_LAYOUT_ROWS = [
  "R?G?BY?P?O?",
  "?GB?YPP?OOR",
  "BB?YP?ORRGG",
  "Y?PO?RRGGCC",
  "P?O?RGGCCK?",
  "O?RRGG?CKKR",
  "RR?GG?CKKRR",
  "?RRGG?CKKR?",
];

const COMBINED_OBS_ROWS = [
  "RRXGBBYYXPXO",
  "GGBBY!PPOORR",
  "BBYYPPOORRGG",
  "YYPPOXXRGGCC",
  "PPWORRGGCCKK",
  "OORR!GCCKKRR",
  "RRAGGCCKKRRR",
  "XRRGGCCKKRRX",
];

const LIGHTING_ROWS = [
  "RRGGBBYYPPOO",
  "GGWBBYYPPOOR",
  "BBWYPPOORRGG",
  "YYPPOORRGGCC",
  "PPWORRGGCCKK",
  "OORR!GCCKKRR",
  "RRAGGCCKKRRR",
  "RRGGBBYYPPOO",
  "GGWBBYYPPOOR",
];

const AIM_REDUCED_ROWS = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  "OORRGGCCKKRR",
  "RRAGGCCKKRRR",
  "!RRGGCCKKRR!",
  "XRRGGCCKKRRX",
];

const BOSS_ROWS = [
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  "OORRGGCCKKRR",
  "RRAGGCCKKRRR",
  "RRGGBBYYPPOO",
  "GGBBYYPPOORR",
  "BBYYPPOORRGG",
  "YYPPOORRGGCC",
  "PPOORRGGCCKK",
  "OORRGGCCKKRR",
  "RRAGGCCKKRRR",
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Tutorial Pop",
    difficulty: "Easy",
    bubbleColors: ["red", "blue", "green"],
    initialRows: TUTORIAL_ROWS,
    descentEveryShots: 12,
    powerUpRates: { aim: 0.1 },
  },
  {
    id: 2,
    title: "Bounce Basics",
    difficulty: "Easy",
    bubbleColors: ["red", "blue", "green", "yellow"],
    initialRows: EASY_PATTERN,
    descentEveryShots: 11,
    powerUpRates: { aim: 0.12 },
  },
  {
    id: 3,
    title: "Angle School",
    difficulty: "Easy",
    bubbleColors: ["red", "blue", "green", "yellow"],
    initialRows: LIMITED_ANGLE_ROWS,
    descentEveryShots: 10,
    powerUpRates: { aim: 0.15 },
    features: { movingWalls: true },
  },
  {
    id: 4,
    title: "Cluster Crunch",
    difficulty: "Medium",
    bubbleColors: ["red", "blue", "green", "yellow", "purple"],
    initialRows: MEDIUM_CLUSTER_ROWS,
    descentEveryShots: 10,
  },
  {
    id: 5,
    title: "Rolling Waves",
    difficulty: "Medium",
    bubbleColors: ["red", "blue", "green", "yellow", "purple"],
    initialRows: MOVING_ROW_BASE,
    descentEveryShots: 9,
    features: { movingRows: true },
  },
  {
    id: 6,
    title: "Color Chaos",
    difficulty: "Medium",
    bubbleColors: ["red", "blue", "green", "yellow", "purple"],
    initialRows: RANDOM_BURSTS_ROWS,
    descentEveryShots: 9,
    randomBubbleChance: 0.2,
  },
  {
    id: 7,
    title: "Bonus Blitz",
    difficulty: "Medium",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange"],
    initialRows: BONUS_ROWS,
    descentEveryShots: 8,
    powerUpRates: { aim: 0.15, freeze: 0.12 },
  },
  {
    id: 8,
    title: "Speed Run",
    difficulty: "Medium",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange"],
    initialRows: DESCENT_ROWS,
    descentEveryShots: 7,
    descentIntervalMs: 15000,
  },
  {
    id: 9,
    title: "Gray Labyrinth",
    difficulty: "Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange"],
    initialRows: OBSTACLE_ROWS,
    descentEveryShots: 7,
    features: { hasObstacles: true },
  },
  {
    id: 10,
    title: "Pattern Storm",
    difficulty: "Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange"],
    initialRows: MULTI_PATTERN_ROWS,
    descentEveryShots: 7,
    randomBubbleChance: 0.15,
  },
  {
    id: 11,
    title: "Rainbow Alley",
    difficulty: "Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan"],
    initialRows: RAINBOW_INTRO_ROWS,
    descentEveryShots: 6,
    powerUpRates: { rainbow: 0.18, bomb: 0.1 },
  },
  {
    id: 12,
    title: "Turbo Gap",
    difficulty: "Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan"],
    initialRows: SPEED_ROWS,
    descentEveryShots: 6,
    descentIntervalMs: 12000,
  },
  {
    id: 13,
    title: "Wall Dancer",
    difficulty: "Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan"],
    initialRows: WALLS_ROWS,
    descentEveryShots: 6,
    features: { movingWalls: true },
  },
  {
    id: 14,
    title: "Time Pulse",
    difficulty: "Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan"],
    initialRows: TIME_ATTACK_ROWS,
    descentEveryShots: 5,
    timeLimitSeconds: 120,
    features: { timeAttack: true },
  },
  {
    id: 15,
    title: "Layer Lock",
    difficulty: "Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"],
    initialRows: DOUBLE_LAYER_ROWS,
    descentEveryShots: 5,
    features: { doubleLayer: true },
  },
  {
    id: 16,
    title: "Shuffle Storm",
    difficulty: "Very Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"],
    initialRows: RANDOM_LAYOUT_ROWS,
    descentEveryShots: 5,
    randomBubbleChance: 0.25,
  },
  {
    id: 17,
    title: "Chaos Engine",
    difficulty: "Very Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"],
    initialRows: COMBINED_OBS_ROWS,
    descentEveryShots: 5,
    features: { movingRows: true, hasObstacles: true },
    powerUpRates: { bomb: 0.15, freeze: 0.15 },
  },
  {
    id: 18,
    title: "Neon Surge",
    difficulty: "Very Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"],
    initialRows: LIGHTING_ROWS,
    descentEveryShots: 4,
    features: { speedBursts: true },
    powerUpRates: { freeze: 0.1, bomb: 0.1, rainbow: 0.12 },
  },
  {
    id: 19,
    title: "Precision Core",
    difficulty: "Very Hard",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"],
    initialRows: AIM_REDUCED_ROWS,
    descentEveryShots: 4,
    features: { reducedAim: true, movingWalls: true },
  },
  {
    id: 20,
    title: "Color Burst Core",
    difficulty: "Expert",
    bubbleColors: ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"],
    initialRows: BOSS_ROWS,
    descentEveryShots: 3,
    descentIntervalMs: 8000,
    features: { movingRows: true, speedBursts: true, constantDescent: true },
    powerUpRates: { bomb: 0.2, rainbow: 0.2, freeze: 0.15, aim: 0.1 },
  },
];
