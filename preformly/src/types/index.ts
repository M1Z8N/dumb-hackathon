export interface Profile {
  id: string;
  name: string;
  age: number;
  preformanceScore: number;
  tags: string[];
  bio: string;
  photoUrl: string | number; // Can be URL string or require() number
  occupation: string;
  location: string;
  interests: string[];
  personality: {
    traits: string[];
    vibe: string;
    communicationStyle: string;
  };
  contactLink?: string;
  autoMatch?: boolean;
}

export interface Hotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  averageScore: number;
  topProfiles: Profile[];
  matchaLoverProbability?: number;
}

export interface EditPrompt {
  id: string;
  text: string;
  scoreBonus: number;
}

export interface RizzLine {
  opener: string;
  followUps: string[];
}