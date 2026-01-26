
# Add "For Artists" Link to Navbar

## Overview
Add the Artist Recognition page link labeled "For Artists" to the Navbar navigation menu across all breakpoints (desktop, tablet, and mobile).

## Implementation Details

### File to Modify
- `src/components/Navbar.tsx`

### Changes

**1. Add new nav item to the `navItems` array (line 22-26)**

Add a new entry for the "For Artists" link. Based on the existing navigation system documented in memory, I'll add it in a logical position. Since it's targeted at artists and relates to creating After Parties, it makes sense to place it after "Create an After Party":

```typescript
const navItems = [
  { label: "After Parties", path: "/find-after-party", colorClass: "text-foreground" },
  { label: "Create an After Party", path: "/create-afterparty", hideOnTablet: true, colorClass: "text-foreground" },
  { label: "For Artists", path: "/for-artists", hideOnTablet: true, colorClass: "text-foreground" },
  { label: "Lokol Listening Sessions", path: "/songs", shortLabel: "Listening Sessions", colorClass: "text-primary" },
];
```

### Behavior Across Breakpoints

| Breakpoint | Visibility |
|------------|------------|
| Desktop (lg+) | Shows in main nav bar |
| Tablet (md-lg) | Hidden in main nav, appears in "More" dropdown |
| Mobile | Shows in hamburger menu |

### Technical Notes
- Setting `hideOnTablet: true` ensures it appears in the "More" dropdown on tablet sizes, keeping the navbar clean
- Uses `text-foreground` color class to match the standard nav item styling (not highlighted like "Lokol Listening Sessions")
- The existing component logic automatically handles all three breakpoints based on the `navItems` array configuration

## Result
The "For Artists" link will navigate users to `/for-artists` (the Artist Recognition Page) and will be accessible from all device sizes.
