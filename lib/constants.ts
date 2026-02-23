// ─── Appwrite Resource IDs ───────────────────────────────────────────────────
// These match the IDs used when creating resources in the Appwrite Console.
export const DATABASE_ID = '6999aa0f0009cfa4eb87';

export const COLLECTIONS = {
  PLACES: 'places',
  CUISINES: 'cuisines',
  NEIGHBORHOODS: 'neighborhoods',
} as const;

// ─── Enums ──────────────────────────────────────────────────────────────────
export const PLACE_STATUS = {
  WANT_TO_GO: 'want_to_go',
  VISITED: 'visited',
} as const;

export type PlaceStatus = (typeof PLACE_STATUS)[keyof typeof PLACE_STATUS];