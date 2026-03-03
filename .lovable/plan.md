

# Add "Given To" Column to Curated Codes Admin

## Overview
Add a `given_to` text column to the `lls_curated_codes` table and an inline editable input field in each row of the admin curated codes page. Typing a name and pressing Enter (or blurring) saves it immediately.

## Changes

### 1. Database migration
Add a nullable `given_to` text column to `lls_curated_codes`:
```sql
ALTER TABLE public.lls_curated_codes ADD COLUMN given_to text;
```

### 2. Edge function update (`supabase/functions/admin-curated-codes/index.ts`)
Add a new `update_given_to` action that accepts `{ id, given_to }` and updates the row.

### 3. Frontend update (`src/pages/AdminCuratedCodes.tsx`)
- Add `given_to` to the `CuratedCode` interface
- Add a "Given To" column header between "Code" and "Status"
- Render an `<input>` in each row pre-filled with the current `given_to` value
- On blur or Enter keypress, call the edge function with `action: "update_given_to"` to persist
- Show a brief toast on save

