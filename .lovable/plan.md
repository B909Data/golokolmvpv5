

## Plan: Replace Hero Image

Replace the current hero background image (`golokol-hero.jpg`) with the newly uploaded image (`GOLOKOL_hero_1.png`).

### Steps

1. **Copy uploaded image** to `src/assets/golokol-hero.png`
2. **Update import** in `src/pages/Index.tsx` — change `import heroImage from "@/assets/golokol-hero.jpg"` to `import heroImage from "@/assets/golokol-hero.png"`

No other changes needed — the `heroImage` variable is already used throughout the component.

