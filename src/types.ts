export interface UserProfile {
  name: string;
  role: string;
  dailyHoursTarget: number;
  mainWeakness: string; // e.g., 'procrastination', 'focus', 'punctuality', 'fatigue'
  goals: string[];
  level: number;
  pdp: number; // Professional Discipline Points
  streak: number;
  lastActive: string; // ISO date
  onboarded: boolean;
}

export interface TimeBlock {
  id: string;
  title: string;
  duration: number; // in minutes
  category: 'Deep Work' | 'Admin' | 'Learning' | 'Routine' | 'Meeting';
  completed: boolean;
  scheduledAt: string; // HH:MM
}

export interface IncidentLog {
  id: string;
  timestamp: string; // ISO string
  type: 'relapse' | 'victory';
  weakness: string;
  description: string;
  pdpDelta: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
  pointsRequired: number;
  category: 'focus' | 'consistency' | 'organization' | 'resilience';
}

export interface AIAdvice {
  mood: string;
  weakness: string;
  insight: string;
  quote: string;
  quoteAuthor: string;
  challenge: string[];
}

export interface StoicJournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  whatWentWell: string;
  whatWentWrong: string;
  howToImprove: string;
  calmLevel: number; // 1 to 5
  disciplinedRating: number; // 1 to 5
  pdpAwarded: number;
}

export interface MotivationalVision {
  ultimateGoal: string;
  whoIFightFor: string;
  unbreakableRule: string;
}

