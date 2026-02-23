import { databases, ID, Query } from '@/lib/appwrite';
import { COLLECTIONS, DATABASE_ID } from '@/lib/constants';
import type { Neighborhood } from '@/lib/types';

export async function listNeighborhoods(): Promise<Neighborhood[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.NEIGHBORHOODS,
    [Query.orderAsc('name'), Query.limit(100)],
  );
  return response.documents as Neighborhood[];
}

export async function createNeighborhood(name: string): Promise<Neighborhood> {
  return (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.NEIGHBORHOODS,
    ID.unique(),
    { name: name.trim() },
  )) as Neighborhood;
}

/**
 * Get or create a neighborhood — used when saving a place.
 * Returns the neighborhood name (normalized).
 */
export async function ensureNeighborhood(name: string): Promise<string> {
  const trimmed = name.trim();
  const existing = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.NEIGHBORHOODS,
    [Query.equal('name', trimmed), Query.limit(1)],
  );
  if (existing.documents.length === 0) {
    await createNeighborhood(trimmed);
  }
  return trimmed;
}
