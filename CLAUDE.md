# CLAUDE.md

## Running the App

There is no build step. 

Serve the repository root via `scripts/start-local-server.sh`

Open `http://localhost:8080` in a browser. The service worker requires HTTPS or localhost to register.

## Architecture

This is a vanilla JavaScript PWA with no framework, no bundler, and no dependencies. All logic lives in three files:

- [main.js](main.js) — entire game logic (~390 lines, single file, uses top-level `await`)
- [style.css](style.css) — all styles; uses CSS custom properties (`--size-s/m/l/xl/xxl`) as design tokens
- [sw.js](sw.js) — service worker; images use cache-first, all other resources use network-first

`index.html` contains almost no markup — the DOM is built entirely by JS via the `createElement()` helper in `main.js`, which wraps `document.createElement` to accept CSS classes, attributes, children, and event handlers in one call.

### Game flow

1. On `init()`, all card images from all card sets are preloaded (`preloadImages`), then game state is restored from `localStorage` or a new game starts. Preloading everything upfront is intentional — it ensures all card sets are available for offline play after the first visit.
2. `cardSets` (array in main.js) defines available card sets — each has an `id`, `name`, `previewImage`, `cards` (array of image paths), and `levels` (array of card counts per level).
3. `createGame()` randomly selects pairs from the card set for a given level; `setupGame()` renders the grid and wires up click logic.
4. Solved cards and current level are saved to `localStorage` after every pair match so the game can survive a page refresh.

### Service worker cache versioning

When any app file changes, increment `VERSION` in [sw.js](sw.js) to bust the cache for all users.

### Adding a new card set

1. Add images to `images/<set-name>/` as sequentially numbered `.webp` files starting at `0.webp`.
   Use `scripts/convert-images.sh <path> <ext>` to batch-convert source images to webp (requires `cwebp`, install via `sudo apt install webp`):
   ```bash
   scripts/convert-images.sh images/my-set png
   ```

   Add a `images/<set-name>/license-notes.txt` to document the licensing of the images
2. Add an entry to the `cardSets` array in [main.js](main.js) with `id`, `name`, `previewImage`, `cards` (use `Array.from({length: N}).map((_, idx) => ...)`), and `levels`.
