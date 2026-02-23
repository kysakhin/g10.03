import { databases, ID, Query } from '@/lib/appwrite';
import type { PlaceStatus } from '@/lib/constants';
import { COLLECTIONS, DATABASE_ID, PLACE_STATUS } from '@/lib/constants';
import type { Place, PlaceFormData } from '@/lib/types';

// Helper to cast Appwrite document arrays
function asPlaces(docs: unknown): Place[] {
  return docs as Place[];
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createPlace(data: PlaceFormData): Promise<Place> {
  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    cuisine: data.cuisine.trim(),
    neighborhood: data.neighborhood.trim(),
    status: data.status || PLACE_STATUS.WANT_TO_GO,
  };

  if (data.reelUrl.trim()) payload.reelUrl = data.reelUrl.trim();
  if (data.thumbnailUrl.trim()) payload.thumbnailUrl = data.thumbnailUrl.trim();
  if (data.mapsUrl.trim()) payload.mapsUrl = data.mapsUrl.trim();
  if (data.notes.trim()) payload.notes = data.notes.trim();
  if (data.rating && Number(data.rating) > 0) payload.rating = Number(data.rating);

  return (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.PLACES,
    ID.unique(),
    payload as any,
  )) as Place;
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function listPlaces(queries: string[] = []): Promise<Place[]> {
  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PLACES,
    [Query.orderDesc('$createdAt'), Query.limit(100), ...queries],
  );
  return asPlaces(response.documents);
}

export async function getPlace(id: string): Promise<Place> {
  return (await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.PLACES,
    id,
  )) as Place;
}

export async function listPlacesByStatus(status: PlaceStatus): Promise<Place[]> {
  return listPlaces([Query.equal('status', status)]);
}

export async function listPlacesFiltered(filters: {
  status?: PlaceStatus;
  cuisine?: string;
  neighborhood?: string;
}): Promise<Place[]> {
  const queries: string[] = [];
  if (filters.status) queries.push(Query.equal('status', filters.status));
  if (filters.cuisine) queries.push(Query.equal('cuisine', filters.cuisine));
  if (filters.neighborhood) queries.push(Query.equal('neighborhood', filters.neighborhood));
  return listPlaces(queries);
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function updatePlace(
  id: string,
  data: Partial<PlaceFormData>,
): Promise<Place> {
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.cuisine !== undefined) payload.cuisine = data.cuisine.trim();
  if (data.neighborhood !== undefined) payload.neighborhood = data.neighborhood.trim();
  if (data.status !== undefined) payload.status = data.status;
  if (data.reelUrl !== undefined) payload.reelUrl = data.reelUrl.trim() || null;
  if (data.thumbnailUrl !== undefined) payload.thumbnailUrl = data.thumbnailUrl.trim() || null;
  if (data.mapsUrl !== undefined) payload.mapsUrl = data.mapsUrl.trim() || null;
  if (data.notes !== undefined) payload.notes = data.notes.trim() || null;
  if (data.rating !== undefined) {
    payload.rating = data.rating && Number(data.rating) > 0 ? Number(data.rating) : null;
  }

  return (await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PLACES,
    id,
    payload,
  )) as Place;
}

export async function markAsVisited(
  id: string,
  rating?: number,
  notes?: string,
): Promise<Place> {
  const payload: Record<string, unknown> = {
    status: PLACE_STATUS.VISITED,
    visitedAt: new Date().toISOString(),
  };
  if (rating) payload.rating = rating;
  if (notes) payload.notes = notes;

  return (await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PLACES,
    id,
    payload,
  )) as Place;
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export async function deletePlace(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PLACES, id);
}

// ─── Random Pick ────────────────────────────────────────────────────────────

export async function getRandomPlace(filters?: {
  cuisine?: string;
  neighborhood?: string;
}): Promise<Place | null> {
  const places = await listPlacesFiltered({
    status: PLACE_STATUS.WANT_TO_GO,
    ...filters,
  });
  if (places.length === 0) return null;
  return places[Math.floor(Math.random() * places.length)];
}
