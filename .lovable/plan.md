

## Copy Change: /lls-us Body Text → Yellow Bullet List

### What changes
Replace the single paragraph (lines 40-42) with a styled bullet list using yellow circular markers, matching the existing design system (`bg-primary` circles).

### Technical details

**File:** `src/pages/LLSUs.tsx`

- Add `Link` import (already imported from react-router-dom)
- Replace the `<p>` block with a `<ul>` containing three `<li>` items, each with a yellow dot (`bg-primary rounded-full`) and `text-[#F0EDE8]` text
- In the third bullet, wrap "Golokol Connect" in a `<Link to="/connect">` styled with `text-primary underline`

```tsx
<ul className="space-y-4 max-w-2xl">
  <li className="flex items-start gap-3">
    <span className="mt-2 h-3 w-3 rounded-full bg-primary flex-shrink-0" />
    <span className="type-subcaption text-[#F0EDE8]">
      Lokol Listens Sessions turns your city's favorite record stores, retail and cafe's into local music discovery hubs.
    </span>
  </li>
  <li className="flex items-start gap-3">
    <span className="mt-2 h-3 w-3 rounded-full bg-primary flex-shrink-0" />
    <span className="type-subcaption text-[#F0EDE8]">
      Music lovers listen, vote and collect their local favorites on Golokol Connect.
    </span>
  </li>
  <li className="flex items-start gap-3">
    <span className="mt-2 h-3 w-3 rounded-full bg-primary flex-shrink-0" />
    <span className="type-subcaption text-[#F0EDE8]">
      Use it to promote shows and sell music direct to your local base.
      {" "}<Link to="/connect" className="text-primary underline">Golokol Connect</Link>
    </span>
  </li>
</ul>
```

Wait — re-reading the brief: "Golokol Connect" in the third bullet should be linked. The third bullet text is "Use it to promote shows and sell music direct to your local base." — but "Golokol Connect" doesn't appear in that bullet. Looking again at the user's request, the link instruction says to link "Golokol Connect" in the third bullet. I'll integrate it naturally, e.g., wrapping the concept or appending. Actually the second bullet mentions "Golokol Connect" too. Let me re-read: "Link 'Golokol Connect' in third bullet to /connect". The third bullet doesn't contain "Golokol Connect" as written. I'll link it in the second bullet where it appears, and confirm with the user — or more likely, the user wants me to adjust the third bullet to reference it. I'll link "Golokol Connect" where it appears in the second bullet, and also consider if the third bullet should mention it. Given the instruction, I'll link the occurrence in the **second** bullet since that's where "Golokol Connect" actually appears, and note this to the user.

**Revised approach:** Link "Golokol Connect" in the second bullet (where it appears) to `/connect`. The third bullet has no mention of it, so no link there unless the user wants revised copy.

