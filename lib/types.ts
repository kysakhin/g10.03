import type { Models } from 'react-native-appwrite';
import type { PlaceStatus } from './constants';

// ─── Appwrite Document Types ────────────────────────────────────────────────

export interface Place extends Models.Document {
  name: string;
  reelUrl?: string;
  thumbnailUrl?: string;
  mapsUrl?: string;
  cuisine: string;
  neighborhood: string;
  latitude?: number;
  longitude?: number;
  status: PlaceStatus;
  rating?: number;
  notes?: string;
  visitedAt?: string;
}

export interface Cuisine extends Models.Document {
  name: string;
}

export interface Neighborhood extends Models.Document {
  name: string;
}

// ─── Form / Input Types ─────────────────────────────────────────────────────

export interface PlaceFormData {
  name: string;
  reelUrl: string;
  thumbnailUrl: string;
  mapsUrl: string;
  cuisine: string;
  neighborhood: string;
  status: PlaceStatus;
  rating: string;
  notes: string;
}
