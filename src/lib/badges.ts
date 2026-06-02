export interface BadgeConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'coding' | 'science' | 'reading' | 'math' | 'behavior';
}

export const BADGES: BadgeConfig[] = [
  {
    id: 'space_explorer',
    name: 'Space Explorer',
    emoji: '🚀',
    description: 'Ventured deep into cosmic calculations and planetary orbits!',
    category: 'science'
  },
  {
    id: 'logic_wizard',
    name: 'Logic Wizard',
    emoji: '🧠',
    description: 'Created beautiful nested loops and bug-free code logic.',
    category: 'coding'
  },
  {
    id: 'reading_star',
    name: 'Reading Star',
    emoji: '⭐️',
    description: 'Showed outstanding pronunciation and read aloud with confidence!',
    category: 'reading'
  },
  {
    id: 'math_champ',
    name: 'Math Champ',
    emoji: '🔢',
    description: 'Solved challenging numerical puzzles and operations flawlessly.',
    category: 'math'
  },
  {
    id: 'creative_coder',
    name: 'Creative Coder',
    emoji: '💻',
    description: 'Designed awesome digital artwork or games using code.',
    category: 'coding'
  },
  {
    id: 'team_player',
    name: 'Team Player',
    emoji: '🤝',
    description: 'Collaborated beautifully, helped others, and shared great ideas.',
    category: 'behavior'
  },
  {
    id: 'super_focus',
    name: 'Super Focus',
    emoji: '🎯',
    description: 'Stayed completely locked into the lesson and asked amazing questions.',
    category: 'behavior'
  },
  {
    id: 'curious_kitten',
    name: 'Curious Kitten',
    emoji: '🐱',
    description: 'Explored new topics with high energy and child-like curiosity.',
    category: 'behavior'
  },
  {
    id: 'dino_discovery',
    name: 'Dino Discovery',
    emoji: '🦖',
    description: 'Uncovered amazing secrets about prehistoric creatures and history!',
    category: 'science'
  }
];

export function getBadgeById(id: string): BadgeConfig | undefined {
  return BADGES.find(b => b.id === id);
}
