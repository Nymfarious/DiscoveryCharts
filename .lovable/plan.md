

# DiscoveryCharts - Complete Analysis and Refactoring Plan

---

## 1. FEATURE INVENTORY (Page by Page / Panel by Panel)

### `/` - Index (Home / Dashboard)
- Welcome message with username from localStorage
- Recent Activity placeholder
- Navigation cards: "Explore Maps" (links to `/history`) and "History AI" (links to `/chat`)
- Admin badge (checks `user_roles` table)
- Settings dropdown: Preferences, Profile, Sign Out
- DevPanel toggle (admin-only floating button)

### `/auth` - Authentication
- Email/password sign-up and sign-in forms
- Email confirmation notice
- Redirects to `/` on success

### `/history` - Map Collection Library
- Poster grid browser (`PosterPicker` component)
- Local file upload (admin-only) via `ingestPoster` edge function
- Cloud URL download (admin-only) via `ingestPoster` edge function
- Sign out button

### `/history/view` - View Poster (ViewPoster)
- Deep-zoom viewer (OpenSeadragon) for DZI tiles
- Hotspot search and list sidebar
- Signed tile URL via `getSignedTile` edge function
- "Map tiles not available" fallback

### `/workspace` - Workspace (main workbench)
- 4-tab layout: Map Library, Map Viewer, Image View, Layer Lab
- **Library tab**: PosterPicker, AssetGallery, HDAdmin upload, ImageUploader
- **Viewer tab**: OpenSeadragon DZI viewer + hotspots sidebar + search
- **Image View tab**: ImageEditor (fabric.js canvas tools)
- **Layer Lab tab**: LayerLab (layer compositing), RegistrationEditor, OverlayCreator link, TextRemovalTool

### `/overlay-creator` - Overlay Creator
- Fabric.js canvas drawing tools (pencil, rect, circle, line, text, arrow)
- Stroke/fill color, width controls
- Save overlay to `overlays` storage bucket + DB record

### `/gis` - GIS Viewer
- Leaflet map with file drop zone
- Supports: GeoJSON, Shapefiles, KML/KMZ, GeoTIFF, images
- Layer panel with visibility, opacity, color, export
- Measurement tools (distance, area)
- IndexedDB persistence

### `/chat` - History AI Assistant (ChatWithMe)
- Chat interface with `historian-qa` edge function (Lovable AI / Gemini)
- Voice recording (WebRTC) with transcription via `voice-to-text` (not deployed)
- Text-to-speech (browser or ElevenLabs via `text-to-speech` edge function)
- Saves chat history to `chat_history` table

### `/chat-history` - Chat History
- Lists past chat Q&As from `chat_history` table
- Copy/delete individual entries

### `/profile` - User Profile
- Name, City/State, Recovery Email, Avatar upload
- Stores in localStorage + `profiles` table for secondary email
- Admin badge display

### `/preferences` - Preferences
- Theme color picker + presets (Vintage Cartographer, Blue, Purple, etc.)
- Voice settings (Browser TTS free vs ElevenLabs premium)
- Email management
- Trusted sources list

### `/tell-me` - Tell Me (Story Prompts)
- Static story prompt list
- Fact-checker toggle (placeholder)

### `/prove-it` - Prove It (Fact Checker)
- Text input for fact-checking
- Placeholder AI summary (no real API call)
- External links to FactScan, FullFact, IFCN

### `/make-it` - Make It (Recipe Manager)
- **1,682 lines** -- NEEDS REFACTORING
- Recipe viewer with step-by-step instructions
- TTS playback of steps
- Manual recipe creation form
- URL fetch (stubbed demo)
- Image gallery with overlay viewer
- Pinned recipes (localStorage)

### `/ekko` - Ekko Voice Lab
- Split panel: Ekko Classic (v3) and Ekko Labs
- Speech recognition + synthesis testing
- Voice personality selection

### `/family-tree` - Family Tree
- **772 lines** -- NEEDS REFACTORING
- GEDCOM file parser and SVG tree visualization
- Friend cards and Family member cards with CRUD
- Nested card dialogs

### `/admin/ingest` - Admin Ingest
- Protected chart upload form (admin-only)
- Calls `ingestPoster` edge function

### DevPanel (component, bottom sheet on Index)
- HDAdmin upload system
- Legacy AdminIngest uploader

### DevTools page (`/dev-tools` -- not routed but exists)
- Progress checklist for DiscoveryCharts features
- AdminIngest embedded

---

## 2. APIs AND EDGE FUNCTIONS

### Active Edge Functions (with real implementation)

| Function | API Keys Needed | Status |
|---|---|---|
| `historian-qa` | `LOVABLE_API_KEY` (auto) | Working - calls Lovable AI Gateway (Gemini 2.5 Flash) |
| `overlay-artist` | `LOVABLE_API_KEY` (auto) | Working - calls Lovable AI Gateway |
| `text-to-speech` | `ELEVENLABS_API_KEY` | Working - calls ElevenLabs API |
| `getSignedTile` | None (uses Supabase storage) | Working - generates signed URLs for tile storage |
| `ingestPoster` | None (uses `SERVICE_ROLE_KEY`) | Working - uploads images + creates poster records |
| `unzip-upload` | None | Working - extracts ZIP archives for HD Admin |

### Stub/Placeholder Edge Functions

| Function | Status | Notes |
|---|---|---|
| `hd-clean-base` | Stub | Returns placeholder JSON; needs real OCR + inpainting service |
| `hd-vectorize` | Stub | Returns placeholder JSON; needs raster-to-SVG conversion |
| `hd-export-pack` | Stub | Returns placeholder JSON; needs PDF/PNG/PPTX generation |
| `hd-bake-overlay` | Stub | Returns placeholder JSON; needs SVG/GeoJSON to PNG rendering |

### Client-Side API Calls (no edge function)

| Feature | Called From | Notes |
|---|---|---|
| `voice-to-text` | ChatWithMe.tsx line 130 | Calls non-existent edge function -- BROKEN |
| Browser SpeechSynthesis | ChatWithMe, Ekko, Preferences, MakeIt | Free, no API key |
| Browser SpeechRecognition | Ekko.tsx | Free, no API key |

### Secrets Configured

- `ELEVENLABS_API_KEY` -- used by `text-to-speech`
- `LOVABLE_API_KEY` -- auto-provisioned, used by `historian-qa` and `overlay-artist`

### API Keys Still Needed (for stubs to become functional)

- **OCR/Inpainting service** for `hd-clean-base` (e.g., Google Vision, AWS Textract, or Lovable AI image models)
- **Rasterization service** for `hd-bake-overlay` (could use Lovable AI image generation)
- **PDF/export library** for `hd-export-pack` (could be done with pdf-lib already installed)
- No additional key needed for `hd-vectorize` if using client-side approach

---

## 3. FILES OVER 500 LINES (Need Refactoring)

| File | Lines | Recommendation |
|---|---|---|
| `src/pages/MakeIt.tsx` | 1,682 | Split into RecipeViewer, RecipeForm, RecipeCard, ImageGallery, PinnedRecipes components |
| `src/pages/FamilyTree.tsx` | 772 | Split into TreeVisualization, FriendCardForm, FamilyCardForm, CardsList |
| `src/pages/Preferences.tsx` | 610 | Split into ThemeSettings, VoiceSettings, EmailSettings, SourceSettings |
| `src/pages/Workspace.tsx` | 577 | Split into WorkspaceLibrary, WorkspaceViewer, WorkspaceImageView tabs |
| `src/components/LayerLab.tsx` | 534 | Split into LayerControls, TimelineFilter, LayerCanvas, CompositeRenderer |

---

## 4. PLAN: DISABLE AUTH (STUB IT)

Replace `LoginGate` with a pass-through component and stub all `supabase.auth` calls:

1. **Create `src/lib/stubAuth.ts`** -- Export a mock user object and stub functions
2. **Modify `LoginGate.tsx`** -- Remove auth check, always render children
3. **Modify pages that call `supabase.auth.getUser()`** -- Index, History, Profile, ChatWithMe, ChatHistory, Workspace, AdminIngest, DevTools, DevPanel, OverlayCreator -- replace with stub user
4. **Modify `Auth.tsx`** -- Auto-redirect to `/` or show "Auth disabled" message
5. **Modify `checkAdminStatus()`** in Index, History, Profile, DevTools, AdminIngest, DevPanel -- return `true` by default

---

## 5. COMPLETE STYLE GUIDE

### Design System Tokens (from `src/index.css`)

#### Color Palette (HSL)

**Light Mode**
```
Background:       hsl(40 25% 95%)     -- warm off-white
Foreground:        hsl(30 20% 20%)     -- dark brown
Card:              hsl(42 30% 92%)     -- light cream
Primary:           hsl(28 70% 45%)     -- burnt orange
Secondary:         hsl(35 40% 75%)     -- tan
Muted:             hsl(40 20% 85%)     -- light taupe
Accent:            hsl(28 60% 60%)     -- warm amber
Destructive:       hsl(0 70% 50%)      -- red
Border:            hsl(35 25% 75%)     -- medium taupe
Input:             hsl(35 25% 80%)     -- light taupe
Ring:              hsl(28 70% 45%)     -- burnt orange (matches primary)
```

**Custom Vintage Tokens**
```
Parchment:         hsl(40 35% 88%)     -- aged paper
Parchment Dark:    hsl(38 30% 78%)     -- darker aged paper
Gold:              hsl(45 90% 55%)     -- bright gold
Brass:             hsl(40 50% 45%)     -- antique brass
Leather:           hsl(25 40% 30%)     -- dark leather brown
```

**Dark Mode**
```
Background:        hsl(30 15% 12%)     -- very dark brown
Foreground:        hsl(40 25% 88%)     -- cream
Card:              hsl(30 20% 18%)     -- dark card
Primary:           hsl(45 90% 55%)     -- gold (swapped)
Muted:             hsl(30 15% 25%)     -- dark muted
Accent:            hsl(40 50% 45%)     -- brass
Gold:              hsl(45 90% 60%)     -- bright gold
```

#### Typography

- **Primary font**: Georgia, serif (headings, titles, branding)
- **Body font**: System default (Tailwind's sans stack)
- **Monospace**: System mono (coordinates, code)

Usage:
```css
style={{ fontFamily: 'Georgia, serif' }}
```

Applied to: Page titles, card titles, branding text, hero text

#### Spacing & Layout

- **Border radius**: `--radius: 0.5rem` (lg: 0.5rem, md: calc - 2px, sm: calc - 4px)
- **Container**: max-width 1400px, center-aligned, 2rem padding
- **Page padding**: `p-6 md:p-8`
- **Max content width**: `max-w-7xl mx-auto` (Workspace), `max-w-4xl` (chat), `max-w-3xl` (profile)
- **Card gap**: `gap-4` to `gap-6`

#### Decorative Elements

**Antique Frame Border** (used on every page):
```css
.fixed.inset-0.pointer-events-none.border-8.border-double.opacity-30.z-50
  border-color: hsl(var(--brass))
```

**Page Background Gradient**:
```css
background: linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%)
background-attachment: fixed
```

**Header Bar (leather gradient)**:
```css
background: linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3))
box-shadow: 0 4px 12px rgba(0,0,0,0.3)
border-bottom: 2px solid hsl(var(--brass))
```

**Card Style**:
```css
border: 2px solid hsl(var(--brass))
background: hsl(var(--card))
box-shadow: xl (Tailwind shadow-xl)
```

**Gold Badge / Admin indicator**:
```css
background: linear-gradient from hsl(var(--gold)) to yellow-600
border: 2px solid yellow-800
text: hsl(var(--leather))
font: bold, xs
```

**Decorative Corners on cards**:
```css
.absolute.top-2.right-2.w-8.h-8.border-t-2.border-r-2.border-[hsl(var(--brass))].opacity-40
.absolute.bottom-2.left-2.w-8.h-8.border-b-2.border-l-2.border-[hsl(var(--brass))].opacity-40
```

#### Button Variants

- `variant="brass"` -- custom variant used across pages (gold/brass gradient)
- `variant="steel"` -- used for cloud download
- `variant="ghost"` -- transparent background, hover state
- `variant="outline"` -- bordered
- `variant="destructive"` -- red for delete/danger

#### Icon Library

Uses `lucide-react` exclusively. Key icons:
- MapPin, Home, LogIn, LogOut, Settings, User, Shield
- Upload, Download, Save, Trash2, Copy, Eye, EyeOff
- Loader2 (spinner), Search, ArrowLeft, Plus
- MessageSquare, History, Mic, Volume2, Play, Square
- Code2 (dev tools), Map, Library, Calendar

#### Animation

```css
accordion-down: 0.2s ease-out
accordion-up: 0.2s ease-out
transition-all duration-300 (card hover)
hover:scale-105 (nav cards)
hover:scale-110 (theme swatches, icon buttons)
animate-spin (Loader2)
```

#### Backgrounds

- `src/assets/parchment-bg-1.jpg` -- body background image (via CSS)
- `src/assets/parchment-bg-2.jpg` -- alternate (unused currently)

#### Component Patterns

**Page Layout Template**:
```
1. Full-height container with parchment gradient
2. Fixed decorative border (brass, border-double, opacity-30)
3. Header bar (leather gradient, brass bottom border)
4. Main content area (max-w, centered, padded)
```

**Header Pattern** (two variants):
- **Leather header**: Dark gradient with parchment-colored text (Index, History, Workspace, Profile)
- **Sticky header**: `sticky top-0 backdrop-blur-sm bg-card/95` (Chat, Ekko, ChatHistory)

**Older pages** (TellMe, ProveIt, FamilyTree): Use a simpler colored sidebar strip + header pattern without the vintage styling -- these are inconsistent and should be updated.

---

## 6. DEV TOOLS ANALYSIS

### DevPanel (`src/components/DevPanel.tsx`)
- Bottom sheet overlay with backdrop blur
- Contains HDAdmin and legacy AdminIngest
- Admin-gated via `user_roles` table query
- Leather gradient styling

### DevTools page (`src/pages/DevTools.tsx`)
- Progress checklist for all DiscoveryCharts features
- 9 completed items, 2 "Coming Soon"
- Embeds AdminIngest
- Admin-gated, redirects non-admins

### Ekko panels (`src/pages/ekko/EkkoClassicPanel.tsx`, `EkkoLabsPanel.tsx`)
- Voice testing tools for speech synthesis
- CSS from `src/ekko-ui-v2.css`, `src/ekko-ui-v3.css`, `src/ekko-ui-labs.css`
- Wiring JS: `src/js/ekko-wiring-v2.js`, `src/js/ekko-wiring-v3.js`, `src/js/ekko-wiring-labs.js`

---

## 7. EXISTING DATA SOURCES IN THE BUILD

- **Supabase tables**: posters, hotspots, base_maps, overlays, overlay_groups, map_assets, chat_history, user_roles, profiles, trusted_sources, request_logs
- **Supabase storage buckets**: tiles, base_maps, overlays
- **IndexedDB**: GIS layer persistence (via `idb` library in `src/lib/gisStorage.ts`)
- **localStorage**: username, favcolor, cityState, secondaryEmail, avatarUrl, voiceProvider, selectedVoiceId, userEmails, selectedEmails, trustedSources, pinnedRecipes, factCheckerEnabled

---

## 8. SUGGESTED PUBLIC MAP-RELATED DATABASES

| Source | URL | Format | Content |
|---|---|---|---|
| Natural Earth | naturalearthdata.com | Shapefile, GeoJSON | Global country boundaries, coastlines, rivers, lakes, cities at multiple scales |
| OpenStreetMap Extracts | download.geofabrik.de | PBF, Shapefile | Detailed worldwide road, building, POI data by region |
| USGS Earth Explorer | earthexplorer.usgs.gov | GeoTIFF, Shapefile | Satellite imagery, elevation data, land cover |
| David Rumsey Map Collection | davidrumsey.com | IIIF, GeoTIFF | 150,000+ historical maps with georeferences |
| Library of Congress Maps | loc.gov/maps | TIFF, JPEG2000 | American historical maps, nautical charts, city plans |
| Old Maps Online | oldmapsonline.org | Links/IIIF | Aggregator of 400,000+ historical maps from multiple archives |
| GADM | gadm.org | Shapefile, GeoJSON | Administrative boundaries for every country |
| OpenHistoricalMap | openhistoricalmap.org | OSM format | Community-curated historical geospatial data |
| World Historical Gazetteer | whgazetteer.org | GeoJSON, CSV | Historical place names and locations through time |
| Georeferencer (British Library) | bl.uk/maps | IIIF | British Library's georeferenced historical maps |
| MapWarper | mapwarper.net | GeoTIFF, WMS | Community-georeferenced historical maps with tile service |
| Copernicus Open Access Hub | scihub.copernicus.eu | GeoTIFF | Sentinel satellite imagery (free) |
| NASA Earthdata | earthdata.nasa.gov | HDF, GeoTIFF | Global satellite imagery and climate data |

---

## 9. IMPLEMENTATION STEPS

### Step 1: Create Stub Auth System
- Create `src/lib/stubAuth.ts` with mock user/session
- Modify `LoginGate.tsx` to pass through
- Update all pages that call auth to use stubs

### Step 2: Refactor Large Files
- **MakeIt.tsx** (1,682 lines) -> 5-6 smaller components
- **FamilyTree.tsx** (772 lines) -> 4 components
- **Preferences.tsx** (610 lines) -> 4 settings cards
- **Workspace.tsx** (577 lines) -> 4 tab components
- **LayerLab.tsx** (534 lines) -> 3-4 sub-components

### Step 3: Create Complete Style Guide File
- Generate `docs/STYLE_GUIDE.md` documenting all tokens, patterns, and usage rules above

### Step 4: Fix Inconsistent Pages
- Update TellMe, ProveIt, FamilyTree to use the standard vintage page layout pattern

