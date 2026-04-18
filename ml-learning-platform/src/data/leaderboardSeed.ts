/* --------------------------------------------------------------------------
 * Fictional leaderboard seed - 50 deterministic Indian students.
 *
 * Uses a mulberry32 PRNG so the list never changes between reloads (no real
 * users yet). Exposes `getWeeklyLeaderboard(userXp)` which splices a "You"
 * entry into the list and returns the sorted-desc result.
 * ------------------------------------------------------------------------ */

export type LeaderboardEntry = {
  id: string;
  name: string;
  avatar: string; // emoji
  xp: number;
  streak: number;
  level: number;
  city: string;
  school?: string;
};

/* Seeded PRNG - deterministic across reloads */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  "Arjun", "Priya", "Ananya", "Rohan", "Kavya",
  "Vikram", "Meera", "Aarav", "Diya", "Karthik",
  "Saanvi", "Ishaan", "Aditi", "Neha", "Siddharth",
  "Pooja", "Raj", "Aarohi", "Devansh", "Zara",
  "Aryan", "Riya", "Vihaan", "Anika", "Krishna",
  "Mehul", "Tanvi", "Advait", "Isha", "Kabir",
  "Rhea", "Ayaan", "Navya", "Atharv", "Ira",
  "Yuvan", "Saisha", "Ved", "Myra", "Shaurya",
  "Aanya", "Reyansh", "Ishita", "Dhruv", "Niharika",
  "Om", "Pari", "Samarth", "Tara", "Varun",
];

const AVATARS = [
  "🐼", "🦊", "🐯", "🦁", "🐻", "🐨", "🦉", "🦋",
  "🐙", "🦀", "🐵", "🐸", "🐰", "🦄", "🐺",
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Pune", "Chennai",
  "Hyderabad", "Kolkata", "Jaipur", "Ahmedabad", "Lucknow",
  "Kochi", "Chandigarh", "Indore", "Bhopal", "Nagpur",
  "Coimbatore", "Vadodara", "Patna", "Varanasi", "Surat",
];

const SCHOOLS = [
  "Delhi Public School",
  "Kendriya Vidyalaya",
  "Ryan International",
  "DAV Public School",
  "St. Xavier's",
  "DPS International",
  "Bal Bharati",
  "Jawahar Navodaya",
  "Army Public School",
  "Modern School",
];

/** Compute level from XP - mirrors the thresholds in gamification.ts loosely. */
function levelFromXp(xp: number): number {
  if (xp >= 10000) return 10;
  if (xp >= 7500) return 9;
  if (xp >= 5000) return 8;
  if (xp >= 3500) return 7;
  if (xp >= 2500) return 6;
  if (xp >= 1700) return 5;
  if (xp >= 1000) return 4;
  if (xp >= 500) return 3;
  if (xp >= 200) return 2;
  return 1;
}

function buildSeed(): LeaderboardEntry[] {
  const rand = mulberry32(0xC0FFEE_42);
  const list: LeaderboardEntry[] = [];

  for (let i = 0; i < 50; i++) {
    const name = NAMES[i % NAMES.length];
    const avatar = AVATARS[Math.floor(rand() * AVATARS.length)];
    // XP distribution: weighted toward middle, 50..12000
    const roll = rand();
    const xp = Math.floor(50 + Math.pow(roll, 1.3) * 11950);
    const streak = Math.floor(rand() * 151); // 0..150
    const city = CITIES[Math.floor(rand() * CITIES.length)];
    const school = rand() > 0.25 ? SCHOOLS[Math.floor(rand() * SCHOOLS.length)] : undefined;

    list.push({
      id: `seed-${i}`,
      name,
      avatar,
      xp,
      streak,
      level: levelFromXp(xp),
      city,
      school,
    });
  }

  return list;
}

export const LEADERBOARD_SEED: LeaderboardEntry[] = buildSeed();

/**
 * Returns the leaderboard with the current user inserted at their real XP
 * level, sorted descending by XP. The "You" entry always has id === "you".
 */
export function getWeeklyLeaderboard(
  userXp: number,
  userName: string = "You",
): LeaderboardEntry[] {
  const youEntry: LeaderboardEntry = {
    id: "you",
    name: userName,
    avatar: "🐼",
    xp: userXp,
    streak: 0,
    level: levelFromXp(userXp),
    city: "India",
  };

  const combined = [...LEADERBOARD_SEED, youEntry];
  combined.sort((a, b) => b.xp - a.xp);
  return combined;
}

/** League thresholds - used by the leaderboard page hero badge. */
export type League =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master";

export function leagueFromXp(xp: number): { name: League; emoji: string; accent: string } {
  if (xp >= 10000) return { name: "Master", emoji: "👑", accent: "var(--accent-lav)" };
  if (xp >= 5000) return { name: "Diamond", emoji: "💎", accent: "var(--accent-sky)" };
  if (xp >= 2500) return { name: "Platinum", emoji: "🏆", accent: "var(--accent-mint)" };
  if (xp >= 1000) return { name: "Gold", emoji: "🥇", accent: "var(--accent-yellow)" };
  if (xp >= 300) return { name: "Silver", emoji: "🥈", accent: "#e5e7eb" };
  return { name: "Bronze", emoji: "🥉", accent: "var(--accent-peach)" };
}
