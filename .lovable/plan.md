

## Implementation Plan: /lls-us Landing Page

### 1. Database Migration
Create two tables:

**`lls_artist_submissions`**: id (uuid PK), artist_name (text NOT NULL), contact_email (text NOT NULL), genre_style (text NOT NULL), city_market (text NOT NULL), physical_product (text NOT NULL — stores full label e.g. "Yes", "In Production", "Not Yet"), how_heard (text, nullable), created_at (timestamptz, default now()). RLS enabled, public INSERT only.

**`lls_retail_signups`**: id (uuid PK), store_name (text NOT NULL), city_location (text NOT NULL), store_type (text NOT NULL), has_listening_station (text NOT NULL), contact_name (text NOT NULL), contact_email (text NOT NULL), notes (text, nullable), created_at (timestamptz, default now()). RLS enabled, public INSERT only.

### 2. New Page: `src/pages/LLSUs.tsx`
- **Hero**: Dark bg, brand fonts, headline/subheadline, two CTAs (smooth scroll to anchors)
- **Artist Section** (`#artist-submission`): Body copy, two-card visual split (In-Store / Live Event), form with all fields. `physical_product` uses RadioGroup with string values "Yes" / "In Production" / "Not Yet"
- **Retail Section** (`#retail-signup`): Contrasting bg, form with Select components for store_type and has_listening_station
- Both forms insert via Supabase client, show success state on completion, toast on error
- Footer included

### 3. Route
Add `/lls-us` to App.tsx. No nav changes.

### Key Detail
The `physical_product` field stores the human-readable option label ("Yes", "In Production", "Not Yet") as confirmed — enabling downstream ICP filtering without needing a lookup.

