
# LLS Guest Pass Page

## Overview
Create a new public page at `/lls/:eventId/pass` for Local Listening Sessions guest pass claims. This is a static form page without database connectivity.

## Route Setup
Add the new route to `src/App.tsx`:
```
/lls/:eventId/pass -> LLSGuestPass component
```

## Page Structure

### File Location
`src/pages/LLSGuestPass.tsx`

### Layout
- Dark background with Navbar and Footer (matching existing page patterns)
- Centered content container (max-w-md)
- Heading: "Get Your LLS Pass"
- Form with 4 fields + submit button

### Form Fields
1. **Name** (text input, required)
2. **Email** (email input, required)
3. **Role** (radio group: Fan, Friend, Industry, Other)
4. **Invite Code** (text input, required)

### Submit Button
- Label: "Get Pass"
- Disabled state while submitting (placeholder for future)

## Technical Details

### Dependencies Used
- React Router (`useParams` for eventId)
- Existing UI components: `Button`, `Input`, `Label`, `RadioGroup`, `RadioGroupItem`
- Layout components: `Navbar`, `Footer`
- React state for form values

### Styling
- Uses existing design system (dark background, yellow primary)
- Form styling consistent with RSVPAfterParty page pattern
- Input styling: `bg-background border-2 border-muted-foreground/30 focus:border-primary`

## Implementation Steps

1. Create `src/pages/LLSGuestPass.tsx` with:
   - URL parameter extraction for eventId
   - Form state management (useState for each field)
   - Radio group for role selection
   - Form submission handler (placeholder, logs to console)

2. Update `src/App.tsx` to add the route:
   - Import `LLSGuestPass` component
   - Add route: `<Route path="/lls/:eventId/pass" element={<LLSGuestPass />} />`
