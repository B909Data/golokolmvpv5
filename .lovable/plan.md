

## Plan: Rebuild Genre Browse & Vote Page with Real Assets

### What changes

Replace the current mock-data-driven `LokolListensGenre.tsx` with real artist images and MP3 audio files for the Hip Hop genre.

### Steps

1. **Copy uploaded assets into the project**
   - Images to `src/assets/`: `Hiphop-fenixandflo.jpeg`, `Hiphop-Jointdexter.png`, `Hiphop-Sque3eze-Rock.png`
   - Audio to `src/assets/audio/`: all 3 MP3 files

2. **Rewrite `src/pages/LokolListensGenre.tsx`**
   - Fix genre slug keys to match routing (`hiphop`, `rnb`, `alternativesoul` — no hyphens)
   - Replace mock data for `hiphop` with 3 real artists:
     - Fenix&Flo — "Who Said? Pt.2" (2:44 / 164s)
     - Jointdexter — "Fye" (2:09 / 129s)
     - Sque3eze — "Rock" (2:33 / 153s)
   - Import images and audio files as ES modules
   - Replace simulated playback with real `<audio>` element playback using `HTMLAudioElement`
   - Track actual `timeupdate` events for progress bar and 50% milestone detection
   - Keep all existing UI/UX: sticky nav, crate points, vote limit modal, responsive grid, footer
   - Keep `rnb` and `alternativesoul` with placeholder "coming soon" state (empty arrays)

3. **No routing changes needed** — route `/lls/genre/:genre` already exists in `App.tsx`

### Technical details

- Audio imports: Vite handles MP3 imports natively, returning a URL string
- Real `<audio>` element replaces `setInterval` simulation — uses `onTimeUpdate`, `onEnded`, `onLoadedMetadata` events
- Progress bar width calculated from `audio.currentTime / audio.duration`
- 50% point detection: check `currentTime >= duration * 0.5` in `timeupdate` handler
- Single shared `<audio>` element ref to avoid multiple simultaneous playbacks

