/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  APPWRITE SCHEMA REFERENCE — Reels Organizer                           │
 * │                                                                        │
 * │  This file documents the exact database, collections, attributes,      │
 * │  indexes, and permissions to create in the Appwrite Console.           │
 * │  It is NOT meant to be executed — it's a reference guide.              │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ─── STEP 0: Create Database ────────────────────────────────────────────────
 *
 *   Database ID : (use whatever Appwrite generated — already done: 6999aa0f0009cfa4eb87)
 *   Name        : reels-organizer
 *
 * ─── STEP 1: Create Collections ─────────────────────────────────────────────
 *
 *   IMPORTANT: When creating each collection, use the custom ID shown below
 *   so the app matches without config changes.
 *
 *   ┌─────────────────┬──────────────────┐
 *   │ Collection ID   │ Name             │
 *   ├─────────────────┼──────────────────┤
 *   │ places          │ Places           │
 *   │ cuisines        │ Cuisines         │
 *   │ neighborhoods   │ Neighborhoods    │
 *   └─────────────────┴──────────────────┘
 *
 * ─── STEP 2: Set Permissions (ALL 3 collections) ───────────────────────────
 *
 *   Since there's no auth, set collection-level permissions to:
 *     Role: Any
 *     Permissions: ✅ Create  ✅ Read  ✅ Update  ✅ Delete
 *
 *   (Settings tab → Permissions → Add role → "Any" → check all 4 boxes)
 *
 * ─── STEP 3: Create Attributes ──────────────────────────────────────────────
 *
 *   Collection: PLACES (ID: "places")
 *   ┌────────────────┬──────────┬───────┬──────────┬─────────────────────────┐
 *   │ Attribute Key  │ Type     │ Size  │ Required │ Default / Notes         │
 *   ├────────────────┼──────────┼───────┼──────────┼─────────────────────────┤
 *   │ name           │ String   │ 255   │ Yes      │                         │
 *   │ reelUrl        │ URL      │ —     │ No       │                         │
 *   │ thumbnailUrl   │ URL      │ —     │ No       │                         │
 *   │ mapsUrl        │ URL      │ —     │ No       │                         │
 *   │ cuisine        │ String   │ 100   │ Yes      │                         │
 *   │ neighborhood   │ String   │ 100   │ Yes      │                         │
 *   │ latitude       │ Float    │ —     │ No       │                         │
 *   │ longitude      │ Float    │ —     │ No       │                         │
 *   │ status         │ Enum     │ —     │ Yes      │ Default: "want_to_go"   │
 *   │                │          │       │          │ Values: want_to_go,     │
 *   │                │          │       │          │         visited         │
 *   │ rating         │ Integer  │ —     │ No       │ Min: 1, Max: 5          │
 *   │ notes          │ String   │ 2000  │ No       │                         │
 *   │ visitedAt      │ Datetime │ —     │ No       │                         │
 *   └────────────────┴──────────┴───────┴──────────┴─────────────────────────┘
 *
 *   Collection: CUISINES (ID: "cuisines")
 *   ┌────────────────┬──────────┬───────┬──────────┬─────────────────────────┐
 *   │ Attribute Key  │ Type     │ Size  │ Required │ Notes                   │
 *   ├────────────────┼──────────┼───────┼──────────┼─────────────────────────┤
 *   │ name           │ String   │ 100   │ Yes      │                         │
 *   └────────────────┴──────────┴───────┴──────────┴─────────────────────────┘
 *
 *   Collection: NEIGHBORHOODS (ID: "neighborhoods")
 *   ┌────────────────┬──────────┬───────┬──────────┬─────────────────────────┐
 *   │ Attribute Key  │ Type     │ Size  │ Required │ Notes                   │
 *   ├────────────────┼──────────┼───────┼──────────┼─────────────────────────┤
 *   │ name           │ String   │ 100   │ Yes      │                         │
 *   └────────────────┴──────────┴───────┴──────────┴─────────────────────────┘
 *
 * ─── STEP 4: Create Indexes ─────────────────────────────────────────────────
 *
 *   Collection: PLACES
 *   ┌──────────────────────────┬────────┬────────────────────────────────────┐
 *   │ Index Key                │ Type   │ Attributes                         │
 *   ├──────────────────────────┼────────┼────────────────────────────────────┤
 *   │ idx_status               │ Key    │ status (ASC)                       │
 *   │ idx_cuisine              │ Key    │ cuisine (ASC)                      │
 *   │ idx_neighborhood         │ Key    │ neighborhood (ASC)                 │
 *   │ idx_status_cuisine       │ Key    │ status (ASC), cuisine (ASC)        │
 *   │ idx_status_neighborhood  │ Key    │ status (ASC), neighborhood (ASC)   │
 *   │ idx_status_nbhd_cuisine  │ Key    │ status (ASC), neighborhood (ASC),  │
 *   │                          │        │ cuisine (ASC)                      │
 *   └──────────────────────────┴────────┴────────────────────────────────────┘
 *
 *   Collection: CUISINES
 *   ┌──────────────────────────┬────────┬────────────────────────────────────┐
 *   │ Index Key                │ Type   │ Attributes                         │
 *   ├──────────────────────────┼────────┼────────────────────────────────────┤
 *   │ idx_name                 │ Unique │ name (ASC)                         │
 *   └──────────────────────────┴────────┴────────────────────────────────────┘
 *
 *   Collection: NEIGHBORHOODS
 *   ┌──────────────────────────┬────────┬────────────────────────────────────┐
 *   │ Index Key                │ Type   │ Attributes                         │
 *   ├──────────────────────────┼────────┼────────────────────────────────────┤
 *   │ idx_name                 │ Unique │ name (ASC)                         │
 *   └──────────────────────────┴────────┴────────────────────────────────────┘
 *
 * ─── DONE ───────────────────────────────────────────────────────────────────
 *
 *   After creating all of the above, the app's service layer (lib/services/*)
 *   will work out of the box. Test by adding a place from the app.
 */

export { }; // make this a module so TS doesn't complain

