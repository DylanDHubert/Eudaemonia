export interface CustomCategory {
  id: string;
  name: string;
  type: string;
  min: number | null;
  max: number | null;
}

export interface CustomCategoryEntry {
  id: string;
  value: number;
  customCategory: CustomCategory;
}

export interface Entry {
  id: string;
  date: string | Date;
  sleepHours: number;
  sleepQuality: number;
  exercise: boolean;
  exerciseTime: number | null;
  alcohol: boolean;
  alcoholUnits: number | null;
  cannabis: boolean;
  cannabisAmount: number | null;
  meditation: boolean;
  meditationTime: number | null;
  socialTime: number | null;
  workHours: number | null;
  meals: number | null;
  foodQuality: number | null;
  stressLevel: number;
  happinessRating: number;
  notes: string | null;
  customCategoryEntries: CustomCategoryEntry[];
} 