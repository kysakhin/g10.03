import { databases, ID, Query } from '@/lib/appwrite';
import { COLLECTIONS, DATABASE_ID } from '@/lib/constants';
import type { Cuisine } from '@/lib/types';

export async function listCuisines(): Promise<Cuisine[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.CUISINES,
    [Query.orderAsc('name'), Query.limit(100)],
  );
  return response.documents as Cuisine[];
}

export async function createCuisine(name: string): Promise<Cuisine> {
  return (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.CUISINES,
    ID.unique(),
    { name: name.trim() },
  )) as Cuisine;
}

/**
 * Get or create a cuisine — used when saving a place.
 * Returns the cuisine name (normalized).
 */
export async function ensureCuisine(name: string): Promise<string> {
  const trimmed = name.trim();
  const existing = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.CUISINES,
    [Query.equal('name', trimmed), Query.limit(1)],
  );
  if (existing.documents.length === 0) {
    await createCuisine(trimmed);
  }
  return trimmed;
}
