

## Plan: Update QR Code Link to Intro Page

Update the share URL in both promote components so the QR code and copy-link point fans to the new intro splash page instead of directly to RSVP.

### Changes

1. **`src/components/artist/tabs/PromoteTab.tsx`** (line 21)
   - Change `shareUrl` from `/after-party/${eventId}/rsvp` → `/after-party/${eventId}/intro`

2. **`src/components/artist/PromoteSection.tsx`** (line 21)
   - Same change to keep both promote components consistent

Both files have identical `shareUrl` definitions. This affects the QR code, the displayed link, the copy button, and the poster PDF download.

