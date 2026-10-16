import { Word, Level } from '../types';

/**
 * Seeded PRNG using Mulberry32 algorithm
 * Produces deterministic pseudorandom numbers based on an integer seed.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string (YYYY-MM-DD) and offset into a 32-bit integer seed
 */
function hashDateString(dateStr: string, offset: number = 0): number {
  let hash = 2166136261;
  const combined = `${dateStr}-salt-${offset}`;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Get current date key in local timezone YYYY-MM-DD
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get human-readable Vietnamese date representation
 * e.g. "Hôm nay, Thứ Tư, 23/09/2026"
 */
export function getFormattedTodayDateVi(): string {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const now = new Date();
  const dayName = days[now.getDay()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const monthNum = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${dayName}, ${dateNum}/${monthNum}/${year}`;
}

/**
 * Deterministically pick a balanced, diverse rotation of words for today.
 * Guarantees cross-category variety (Food, Travel, Daily, Work, Emotion, etc.)
 * so the exercises change refreshingly every single calendar day.
 */
export function getDailyRotatedWords(
  allWords: Word[],
  dateKey: string = getTodayDateKey(),
  offset: number = 0,
  count: number = 12,
  filterLevel: Level | 'all' = 'all'
): Word[] {
  let pool = filterLevel === 'all' ? [...allWords] : allWords.filter((w) => w.level === filterLevel);

  if (pool.length <= count) {
    return pool;
  }

  const seed = hashDateString(dateKey, offset);
  const rng = mulberry32(seed);

  // Group words by category for diverse stratified representation
  const byCategory: Record<string, Word[]> = {};
  pool.forEach((w) => {
    const cat = w.category || 'daily';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(w);
  });

  // Shuffle within each category deterministically
  const categories = Object.keys(byCategory).sort();
  categories.forEach((cat) => {
    const items = byCategory[cat];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  });

  // Round-robin selection across categories
  const selected: Word[] = [];
  const selectedIds = new Set<string>();

  let categoryIndex = 0;
  let attempts = 0;
  const maxAttempts = pool.length * 3;

  while (selected.length < count && attempts < maxAttempts) {
    const currentCat = categories[categoryIndex % categories.length];
    const catList = byCategory[currentCat];

    if (catList && catList.length > 0) {
      const word = catList.find((w) => !selectedIds.has(w.id));
      if (word) {
        selected.push(word);
        selectedIds.add(word.id);
      }
    }

    categoryIndex++;
    attempts++;
  }

  // Fallback if not enough words selected through categories
  if (selected.length < count) {
    const remaining = pool.filter((w) => !selectedIds.has(w.id));
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    for (const w of remaining) {
      if (selected.length >= count) break;
      selected.push(w);
      selectedIds.add(w.id);
    }
  }

  return selected;
}

const STREAK_STORAGE_KEY = 'hango_daily_streak_v1';

export interface DailyStreakData {
  lastCompletedDate: string | null;
  currentStreak: number;
  completedToday: boolean;
}

export function getDailyStreak(): DailyStreakData {
  try {
    const saved = localStorage.getItem(STREAK_STORAGE_KEY);
    const today = getTodayDateKey();
    if (saved) {
      const parsed = JSON.parse(saved);
      const isToday = parsed.lastCompletedDate === today;
      return {
        lastCompletedDate: parsed.lastCompletedDate || null,
        currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 1,
        completedToday: isToday,
      };
    }
  } catch (e) {
    console.error('Error reading streak storage', e);
  }

  return {
    lastCompletedDate: null,
    currentStreak: 1,
    completedToday: false,
  };
}

export function recordDailyCompletion(): DailyStreakData {
  const today = getTodayDateKey();
  const current = getDailyStreak();

  if (current.lastCompletedDate === today) {
    return { ...current, completedToday: true };
  }

  // Calculate if consecutive from yesterday
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yYear = yesterday.getFullYear();
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayKey = `${yYear}-${yMonth}-${yDay}`;

  let newStreak = 1;
  if (current.lastCompletedDate === yesterdayKey) {
    newStreak = current.currentStreak + 1;
  } else if (current.lastCompletedDate === null) {
    newStreak = 1;
  }

  const updated: DailyStreakData = {
    lastCompletedDate: today,
    currentStreak: newStreak,
    completedToday: true,
  };

  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error writing streak storage', e);
  }

  return updated;
}
