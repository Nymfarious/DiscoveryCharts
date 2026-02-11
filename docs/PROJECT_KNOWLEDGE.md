# DiscoveryCharts — Complete Project Knowledge
## For AI assistants and future development

---

## 1. PROJECT IDENTITY

**Name:** DiscoveryCharts (formerly "History Discoveries")
**Purpose:** HD layered historical map viewer and research assistant. Users browse, upload, and overlay antique maps, ask AI-powered history questions, manage recipes, build family trees, and explore GIS data.
**Tagline:** "HD Layered Historical Maps"
**Aesthetic:** Vintage Cartographer — an 18th-century mapmaker's private study

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| State | React hooks + localStorage + React Query |
| Routing | react-router-dom v6 |
| Backend | Lovable Cloud (Supabase) — edge functions, database, storage |
| AI | Lovable AI Gateway (google/gemini-2.5-flash) via `historian-qa` edge function |
| TTS | Browser SpeechSynthesis (free) or ElevenLabs (premium, via `text-to-speech` edge function) |
| Maps | OpenSeadragon (DZI deep-zoom), Leaflet + react-leaflet (GIS), fabric.js (canvas drawing) |
| GIS formats | GeoJSON, Shapefile (shpjs), KML/KMZ (@tmcw/togeojson), GeoTIFF (geotiff) |
| Validation | Zod schemas in `src/lib/validation.ts` |
| Icons | lucide-react (exclusively) |
| Fonts | Georgia serif (headings), system sans (body) |

---

## 3. AUTHENTICATION STATUS

**Auth is STUBBED.** Real Supabase auth exists in DB but the client bypasses it:

- `src/lib/stubAuth.ts` — exports `STUB_USER`, `STUB_SESSION`, `isAdminStub()` (always returns `true`)
- `src/components/LoginGate.tsx` — pass-through, renders children without auth checks
- `src/pages/Auth.tsx` — auto-redirects to `/`
- All pages use `isAdmin = true` by default
- Edge functions still verify JWT (will fail without real auth token)

---

## 4. ROUTES & PAGES

| Route | Page Component | Purpose | Auth Required |
|---|---|---|---|
| `/` | Index | Dashboard with nav cards, admin badge, DevPanel | Stubbed |
| `/auth` | Auth | Auto-redirects to `/` (stubbed) | No |
| `/history` | History | Poster grid browser, upload (admin) | LoginGate |
| `/history/view` | ViewPoster | OpenSeadragon DZI deep-zoom viewer + hotspots | LoginGate |
| `/workspace` | Workspace | 4-tab workbench: Library, Viewer, Image, LayerLab | LoginGate |
| `/overlay-creator` | OverlayCreator | Fabric.js canvas drawing tools, save overlays | LoginGate |
| `/gis` | GISViewer | Leaflet map, file drop, measurement tools | No |
| `/chat` | ChatWithMe | History AI assistant via `historian-qa` | No |
| `/chat-history` | ChatHistory | Past Q&A list from `chat_history` table | LoginGate |
| `/profile` | Profile | Name, avatar, recovery email | LoginGate |
| `/preferences` | Preferences | Theme, voice, email, trusted sources | LoginGate |
| `/tell-me` | TellMe | Static story prompt list | No |
| `/prove-it` | ProveIt | Fact-checker placeholder | No |
| `/make-it` | MakeIt | Recipe manager with TTS playback | No |
| `/ekko` | Ekko | Voice lab — speech recognition + synthesis | No |
| `/family-tree` | FamilyTree | GEDCOM parser, SVG tree, friend/family cards | No |
| `/admin/ingest` | AdminIngest | Admin-only chart upload form | LoginGate |

---

## 5. EDGE FUNCTIONS

### Working

| Function | Model/API | Secret | What it does |
|---|---|---|---|
| `historian-qa` | Lovable AI Gateway (gemini-2.5-flash) | `LOVABLE_API_KEY` (auto) | Answers history questions; two modes: simple chat or structured map-comparison with trusted sources |
| `text-to-speech` | ElevenLabs API | `ELEVENLABS_API_KEY` | Converts text to audio MP3 via ElevenLabs `eleven_multilingual_v2` model |
| `getSignedTile` | Supabase Storage | None | Generates 10-min signed URLs for DZI tile files in `tiles` bucket |
| `ingestPoster` | Supabase Storage + DB | `SUPABASE_SERVICE_ROLE_KEY` (auto) | Admin-only: uploads poster image to `tiles` bucket, creates `posters` DB record |
| `unzip-upload` | Supabase Storage | None | Extracts ZIP archives for HD Admin tile uploads |

### Partially Working (have code but limited functionality)

| Function | Status | What's missing |
|---|---|---|
| `hd-clean-base` | Passes through image without real OCR/inpainting | Needs real OCR service (e.g., Lovable AI image model) for text detection + removal |
| `overlay-artist` | Calls Lovable AI Gateway | Works but depends on structured prompts |

### Stub / Placeholder

| Function | Status |
|---|---|
| `hd-vectorize` | Returns placeholder JSON; needs raster-to-SVG conversion |
| `hd-export-pack` | Returns placeholder JSON; could use `pdf-lib` (already installed) |
| `hd-bake-overlay` | Returns placeholder JSON; needs SVG/GeoJSON to PNG rendering |

### Broken / Non-existent

| Feature | Issue |
|---|---|
| `voice-to-text` | ChatWithMe.tsx calls `/functions/v1/voice-to-text` but NO edge function exists at that path |

---

## 6. SECRETS

| Secret | Status | Used By |
|---|---|---|
| `LOVABLE_API_KEY` | Auto-provisioned (cannot delete) | `historian-qa`, `overlay-artist` |
| `ELEVENLABS_API_KEY` | Configured | `text-to-speech` |

API keys are NEVER exposed in client code. All external API calls go through edge functions.

---

## 7. DATABASE TABLES

| Table | Purpose | Key Columns |
|---|---|---|
| `posters` | Map/chart metadata | id, title, credit, dzi_path, license_status, thumb_url, created_by |
| `hotspots` | Points of interest on posters | id, poster_id (FK→posters), title, snippet, x, y, zoom, tags[] |
| `base_maps` | HD base map files | id, title, region, file_path, registration (JSON), projection, print_dpi |
| `overlays` | Overlay layers on base maps | id, base_map_id (FK→base_maps), theme, year, file_path, z_index |
| `overlay_groups` | Named overlay collections | id, title, base_map_id, overlay_ids[] |
| `map_assets` | Uploaded map files | id, title, file_path, file_type, description |
| `chat_history` | AI chat Q&A log | id, user_id, question, answer |
| `profiles` | Extended user data | id, user_id, secondary_email |
| `user_roles` | Admin role assignments | id, user_id, role (enum: 'user' \| 'admin') |
| `trusted_sources` | Domains for historian AI | id, domain, label |
| `request_logs` | Rate limiting records | id, user_id, endpoint, response_time_ms |
| `exports` | Generated export files | id, base_map_id, kind, overlay_ids[], file_path |

---

## 8. STORAGE BUCKETS

| Bucket | Content |
|---|---|
| `tiles` | DZI tile pyramids, uploaded poster images, clean base map files |
| `base_maps` | HD base map source files |
| `overlays` | Generated overlay PNGs/SVGs |

---

## 9. CLIENT-SIDE STORAGE

| Store | Keys |
|---|---|
| **localStorage** | username, favcolor, cityState, secondaryEmail, avatarUrl, voiceProvider, selectedVoiceId, userEmails, selectedEmails, trustedSources, pinnedRecipes, factCheckerEnabled |
| **IndexedDB** | GIS layer persistence via `idb` library (`src/lib/gisStorage.ts`) |

---

## 10. COMPONENT ARCHITECTURE

### Refactored Components (extracted from large page files)

| Directory | Components | Extracted From |
|---|---|---|
| `src/components/makeit/` | RecipeTypes.ts, RecipeForm.tsx, RecipeViewer.tsx, PinnedRecipes.tsx | MakeIt.tsx (was 1,682 lines) |
| `src/components/familytree/` | TreeVisualization.tsx, FriendCardForm.tsx, FamilyCardForm.tsx, CardsViewer.tsx | FamilyTree.tsx (was 772 lines) |
| `src/components/preferences/` | ThemeSettings.tsx, VoiceSettings.tsx, EmailSettings.tsx, TrustedSourcesSettings.tsx | Preferences.tsx (was 610 lines) |
| `src/components/layerlab/` | LayerControls.tsx | LayerLab.tsx (was 534 lines) |

### Key Standalone Components

| Component | Purpose |
|---|---|
| `LoginGate.tsx` | Auth wrapper (stubbed — pass-through) |
| `DevPanel.tsx` | Admin bottom sheet with HDAdmin + AdminIngest |
| `PosterPicker.tsx` | Grid browser for poster collection |
| `AssetGallery.tsx` | Map asset browser |
| `ImageEditor.tsx` | Fabric.js canvas tools |
| `ImageUploader.tsx` | File upload component |
| `LayerLab.tsx` | Layer compositing workbench |
| `LayerCompare.tsx` | Side-by-side layer comparison |
| `RegistrationEditor.tsx` | Map registration point editor |
| `TextRemovalTool.tsx` | OCR-based text removal from maps |
| `RecolorTool.tsx` | Color adjustment for map overlays |
| `HistoryViewer.tsx` | Version history browser |
| `ExportLayers.tsx` | Export layer compositions |

### GIS Components (`src/components/gis/`)

| Component | Purpose |
|---|---|
| `MapView.tsx` | Leaflet map container |
| `FileDropZone.tsx` | Drag-and-drop file loader |
| `LayerPanel.tsx` | Layer visibility/opacity/color controls |
| `MeasureTools.tsx` | Distance and area measurement |

---

## 11. VALIDATION SCHEMAS (`src/lib/validation.ts`)

| Schema | Fields | Max Length |
|---|---|---|
| `profileSchema` | name (required), cityState, secondaryEmail | 100, 200, 255 |
| `chatPromptSchema` | prompt (required) | 2000 |
| `overlayCreatorSchema` | region, baseYear (4-digit), compareYears, question, theme | 200, 4, 500, 1000, 100 |
| `chartUploadSchema` | title (required), credit, licenseStatus (enum) | 200, 500 |

---

## 12. RATE LIMITING

Implemented in `supabase/functions/_shared/rateLimit.ts`. All edge functions that call external APIs check the `request_logs` table before proceeding. Rate-limited functions: `historian-qa`, `text-to-speech`.

---

## 13. INSTALLED DEPENDENCIES (Notable)

| Package | Purpose |
|---|---|
| `openseadragon` | Deep-zoom image viewer (DZI tiles) |
| `fabric` | Canvas drawing/editing (overlays, image editor) |
| `leaflet` + `react-leaflet` | GIS map rendering |
| `shpjs` | Shapefile parsing |
| `@tmcw/togeojson` | KML/KMZ to GeoJSON conversion |
| `geotiff` | GeoTIFF raster loading |
| `jszip` | ZIP file extraction |
| `pdf-lib` | PDF generation (for exports) |
| `pptxgenjs` | PowerPoint generation (for exports) |
| `tesseract.js` | Client-side OCR |
| `@11labs/react` + `elevenlabs` | ElevenLabs TTS integration |
| `@huggingface/transformers` | Client-side ML models |
| `idb` | IndexedDB wrapper (GIS persistence) |
| `zod` | Schema validation |
| `react-beautiful-dnd` | Drag-and-drop (layer ordering) |
| `recharts` | Data visualization charts |
| `sharp` | Image processing (server-side, used in scripts) |

---

## 14. DESIGN SYSTEM — VINTAGE CARTOGRAPHER

### 14.1 Philosophy

**Theme:** An 18th-century mapmaker's private study — warm parchment paper, brass instruments, leather-bound journals, gold-leaf accents.
**Personality:** Scholarly, warm, tactile, trustworthy. Never cold, never clinical.
**Key rule:** Pure white (`#fff`) and pure black (`#000`) NEVER appear. The lightest surface is `hsl(40 25% 95%)`.

### 14.2 Color Tokens (HSL — exact values from `src/index.css`)

#### Light Mode

| Token | HSL | Hex Approx | Usage |
|---|---|---|---|
| `--background` | `40 25% 95%` | `#f5f0e8` | Page fallback behind gradient |
| `--foreground` | `30 20% 20%` | `#3d3428` | Primary body text |
| `--card` | `42 30% 92%` | `#efe8d8` | Card surfaces, panels |
| `--card-foreground` | `30 20% 20%` | `#3d3428` | Text on cards |
| `--popover` | `42 30% 90%` | `#e8dfc8` | Dropdown/popover surfaces |
| `--popover-foreground` | `30 20% 20%` | `#3d3428` | Text in popovers |
| `--primary` | `28 70% 45%` | `#c2682a` | Burnt orange — CTA emphasis, focus ring |
| `--primary-foreground` | `42 30% 95%` | `#f5efe3` | Text on primary buttons |
| `--secondary` | `35 40% 75%` | `#d4c3a0` | Tan — secondary surfaces |
| `--secondary-foreground` | `30 20% 20%` | `#3d3428` | Text on secondary |
| `--muted` | `40 20% 85%` | `#ddd6c8` | Disabled/subtle backgrounds |
| `--muted-foreground` | `30 10% 40%` | `#6b6158` | Subtle text, timestamps, placeholders |
| `--accent` | `28 60% 60%` | `#d4884a` | Warm amber — hover highlights |
| `--accent-foreground` | `30 20% 20%` | `#3d3428` | Text on accent |
| `--destructive` | `0 70% 50%` | `#d93636` | Delete/danger red |
| `--destructive-foreground` | `42 30% 95%` | `#f5efe3` | Text on destructive |
| `--border` | `35 25% 75%` | `#c9b99a` | General borders |
| `--input` | `35 25% 80%` | `#d4c8ae` | Input field borders |
| `--ring` | `28 70% 45%` | `#c2682a` | Focus ring (matches primary) |

#### Custom Vintage Tokens

| Token | HSL | Hex Approx | Usage |
|---|---|---|---|
| `--parchment` | `40 35% 88%` | `#e8dcc0` | Page gradient start, header text color |
| `--parchment-dark` | `38 30% 78%` | `#d1c2a0` | Page gradient end |
| `--gold` | `45 90% 55%` | `#e8c420` | Gold leaf — badges, icon bg, hover states |
| `--brass` | `40 50% 45%` | `#ab8c36` | Antique brass — borders, decorative corners, links |
| `--leather` | `25 40% 30%` | `#6b4a2e` | Dark leather brown — header gradient, button text |

#### Dark Mode

| Token | HSL | Hex Approx | Usage |
|---|---|---|---|
| `--background` | `30 15% 12%` | `#231e18` | Deep brown base |
| `--foreground` | `40 25% 88%` | `#e8dcc0` | Cream text |
| `--card` | `30 20% 18%` | `#372d22` | Card surfaces |
| `--primary` | `45 90% 55%` | `#e8c420` | Gold becomes primary |
| `--primary-foreground` | `30 15% 12%` | `#231e18` | Dark text on gold |
| `--secondary` | `35 25% 30%` | `#5e4f3d` | Dark secondary |
| `--muted` | `30 15% 25%` | `#4a3d2e` | Dark muted surfaces |
| `--muted-foreground` | `40 15% 65%` | `#b3a488` | Muted text |
| `--accent` | `40 50% 45%` | `#ab8c36` | Brass accent |
| `--border` | `30 15% 28%` | `#4a3e30` | Dark borders |
| `--gold` | `45 90% 60%` | `#ebc82a` | Slightly brighter gold |
| `--brass` | `40 60% 50%` | `#cc9e33` | Brighter brass |
| `--leather` | `25 30% 18%` | `#3a2e22` | Darker leather |
| `--parchment` | `30 20% 22%` | `#42362a` | Dark parchment |
| `--parchment-dark` | `30 20% 15%` | `#2e251c` | Darkest parchment |

### 14.3 Typography

| Role | Font | Fallback | Where Used |
|---|---|---|---|
| Display / Headings | Georgia | serif | Page titles (h1), card titles, hero text, section headers |
| Body | System UI | Tailwind sans stack | Paragraphs, labels, form text, descriptions |
| Monospace | System mono | Tailwind mono stack | Coordinates, code snippets, debug info |

**Application:**
```css
style={{ fontFamily: 'Georgia, serif' }}  /* All headings */
```

| Context | Classes |
|---|---|
| Page title on leather header | `text-2xl font-bold tracking-wide text-[hsl(var(--parchment))]` + `textShadow: '2px 2px 4px rgba(0,0,0,0.5)'` |
| Hero/welcome text | `text-4xl font-bold` with Georgia |
| Section titles inside cards | `text-xl font-semibold` with Georgia |
| Body text | `text-foreground` (system font) |
| Subtle/secondary text | `text-muted-foreground` |
| Text on leather header | `text-[hsl(var(--parchment))]` |
| Decorative subtitles | `text-[hsl(var(--parchment))]/70` (70% opacity) |
| Links | `text-[hsl(var(--brass))]` hover: `text-[hsl(var(--gold))]` |

### 14.4 Page Shell (REQUIRED on every page)

```tsx
<div className="min-h-screen" style={{
  background: 'linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%)',
  backgroundAttachment: 'fixed'
}}>
  {/* 1. Decorative frame border — ALWAYS present */}
  <div className="fixed inset-0 pointer-events-none border-8 border-double opacity-40 z-50"
       style={{ borderColor: 'hsl(var(--brass))' }} />

  {/* 2. Leather header bar */}
  <div className="relative border-b-2 border-[hsl(var(--brass))] shadow-lg"
       style={{
         background: 'linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3))',
         boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
       }}>
    <div className="px-8 py-6 flex items-center gap-4">
      {/* Back button + gold icon badge + title */}
    </div>
  </div>

  {/* 3. Content area */}
  <div className="px-8 py-10 max-w-{size} mx-auto">
    {/* Page content */}
  </div>
</div>
```

**Alternate header** (for chat/scroll-heavy pages):
```
sticky top-0 z-20 backdrop-blur-sm bg-card/95 border-b-2 border-[hsl(var(--brass))] shadow-lg
```

### 14.5 Max-Width by Page Type

| Page Type | Max Width | Examples |
|---|---|---|
| Dashboard | `max-w-6xl` | Index |
| Form / Single column | `max-w-4xl` | TellMe, ProveIt, Chat, Profile, Preferences |
| Multi-column workspace | `max-w-7xl` | Workspace, History |
| Tree / visualization | `max-w-5xl` | FamilyTree |
| Full-width tool | No max | GIS Viewer, Overlay Creator |

### 14.6 Gold Icon Badge (header seal)

```tsx
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--brass))]
                flex items-center justify-center shadow-lg">
  <IconName className="w-5 h-5 text-[hsl(var(--leather))]" />
</div>
```

Dashboard variant uses `w-12 h-12` with `w-6 h-6` icon.

### 14.7 Card Pattern

```tsx
<div className="relative p-6 bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))]
                rounded-lg shadow-xl">
  {/* Content */}

  {/* Decorative corners (REQUIRED on featured cards) */}
  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2
                  border-[hsl(var(--brass))] opacity-40" />
  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2
                  border-[hsl(var(--brass))] opacity-40" />
</div>
```

Corner sizes: Featured `w-8 h-8 border-2 opacity-40`, List items `w-5 h-5 border opacity-30`, Stats `w-4 h-4 border opacity-30`.

### 14.8 Navigation Card (Dashboard)

```
Background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--parchment-dark)) 100%)
Border: 2px solid border → hover: gold
Shadow: 0 4px 12px rgba(0,0,0,0.2) → hover: shadow-2xl
Scale: hover:scale-105 transition-all duration-300
Icon container: rounded-full bg-gradient-to-br from-amber-700 to-amber-900 (or stone-700→stone-900)
Icon: w-8 h-8 text-[hsl(var(--parchment))]
Title: Georgia serif, text-2xl font-bold
Decorative corners: w-8 h-8 border-2 brass opacity-40
```

### 14.9 Hoverable List Item

```tsx
<div className="relative p-4 bg-[hsl(var(--card))] rounded-lg border-2 border-[hsl(var(--border))]
                hover:border-[hsl(var(--gold))] cursor-pointer transition-all duration-300
                hover:shadow-lg hover:scale-[1.01]"
     style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
```

### 14.10 Button System

| Variant | Gradient | Text Color | Usage |
|---|---|---|---|
| **Brass** (Primary CTA) | `from-[hsl(var(--brass))] to-[hsl(var(--gold))]` | `text-[hsl(var(--leather))]` | Main actions, submit |
| **Leather** (Secondary CTA) | `from-[hsl(var(--leather))] to-[hsl(var(--brass))]` | `text-[hsl(var(--parchment))]` | Secondary actions |
| **Ghost** (Header nav) | transparent | `text-[hsl(var(--parchment))]` | Back button, header links |
| **Outline** | border only | inherits | Secondary options |
| **Destructive** | red | white | Delete/danger |

Admin badge:
```tsx
<div className="px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-yellow-600
                border border-yellow-800 shadow-md">
  <span className="text-xs font-bold text-[hsl(var(--leather))]">ADMIN</span>
</div>
```

### 14.11 Dev Tools FAB

```tsx
<button className="fixed bottom-6 left-6 z-30 p-4 rounded-full
                   bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--brass))]
                   shadow-2xl hover:scale-110 transition-all duration-200
                   border-2 border-[hsl(var(--leather))]
                   hover:shadow-[0_0_30px_rgba(218,165,32,0.5)]">
  <Code2 className="w-6 h-6 text-[hsl(var(--leather))]" />
</button>
```

### 14.12 Shadows & Depth

| Level | Value | Usage |
|---|---|---|
| Subtle | `0 2px 8px rgba(0,0,0,0.1)` | List items, inputs |
| Card | Tailwind `shadow-xl` | Cards, panels |
| Header | `0 4px 12px rgba(0,0,0,0.3)` | Leather header bar |
| Dropdown | `0 8px 24px rgba(0,0,0,0.4)` | Popovers, floating menus |
| Elevated | Tailwind `shadow-2xl` | Hovered cards, FAB |
| Glow | `0 0 30px rgba(218,165,32,0.5)` | Dev tools button hover |

### 14.13 Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius` (lg) | `0.5rem` (8px) | Cards, panels, buttons |
| md | `calc(0.5rem - 2px)` = 6px | Inputs, smaller elements |
| sm | `calc(0.5rem - 4px)` = 4px | Badges, tags |
| Full | `rounded-full` | Avatars, icon circles, FAB |

### 14.14 Icons (lucide-react)

| Context | Size |
|---|---|
| Header gold badge (dashboard) | `w-6 h-6` |
| Header gold badge (sub-pages) | `w-5 h-5` |
| Inline with text / buttons | `w-4 h-4` |
| Navigation card icon | `w-8 h-8` |
| Standalone large / empty states | `w-12 h-12` |

Key icons by feature:

| Feature | Icons |
|---|---|
| Maps / Navigation | `MapPin`, `Map` |
| Chat / AI | `MessageSquare`, `Send` |
| Settings | `Settings` |
| Profile | `User` |
| Admin | `Shield` |
| Upload / Download | `Upload`, `Download` |
| Delete | `Trash2` |
| Search | `Search` |
| Back | `ArrowLeft` |
| Loading | `Loader2` (with `animate-spin`) |
| Dev Tools | `Code2` |
| Voice / Audio | `Mic`, `Volume2`, `Play`, `Square` |
| Family Tree | `TreePine`, `Users`, `UserPlus` |
| Story / Tell Me | `BookOpen` |
| History / Clock | `History` |
| Eye / Visibility | `Eye`, `EyeOff` |
| Activity | `Activity` |
| Home | `Home` |

### 14.15 Animations

| Element | Animation | Duration |
|---|---|---|
| Card hover | `transition-all` | `300ms` |
| Nav card scale | `hover:scale-105` | `300ms` |
| List item scale | `hover:scale-[1.01]` | `300ms` |
| Theme swatch | `hover:scale-110` | `200ms` |
| FAB hover | `hover:scale-110` | `200ms` |
| Accordion | `accordion-down/up` | `200ms ease-out` |
| Spinner | `animate-spin` | continuous |
| Border color | `transition-colors` | `300ms` |

### 14.16 Backgrounds

**Page gradient** (primary):
```css
background: linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%);
background-attachment: fixed;
```

**Body background image** (fallback layer in `index.css`):
```css
body {
  background-image: url('/src/assets/parchment-bg-1.jpg');
  background-size: cover;
  background-attachment: fixed;
}
```

**Header gradient:**
```css
background: linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3));
```

**Navigation card gradient:**
```css
background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--parchment-dark)) 100%);
```

### 14.17 Z-Index Stack

| Layer | Z-Index | Element |
|---|---|---|
| Content | 0 | Normal page flow |
| Sticky headers | 10-20 | Chat/Ekko sticky bars |
| Sidebar overlays | 20 | Settings dropdown, popovers |
| Dev tools FAB | 30 | Fixed bottom-left button |
| Decorative frame | 50 | `border-double` frame overlay |
| Modals/dialogs | 50+ | shadcn Dialog (auto-managed) |

---

## 15. VISUAL SIGNATURES (What Makes This App Unique)

1. **Brass Double-Frame Border** — Fixed `border-8 border-double` at `z-50` on every page. Looks like viewing through an antique picture frame.
2. **Leather-to-Brass Header** — `hsl(25 40% 30%)` → `hsl(40 50% 45%/0.3)` gradient reads as leather bookbinding.
3. **Gold Icon Badges** — Rounded gold-to-brass gradient circles holding lucide icons in leather brown. The "seal" motif.
4. **Decorative Corner Brackets** — L-shaped brass borders (top-right + bottom-left) at 30-40% opacity. Evokes map borders and certificates.
5. **Parchment Gradient Background** — Diagonal gradient from warm cream to darker parchment gives depth without images.
6. **Georgia Serif Headings** — While nearly every modern app uses sans-serif, DiscoveryCharts uses Georgia for all titles.
7. **Warm Brown-Gold Palette** — Entire color system in the 25°-45° hue range (no blue, no purple, no gray-blue).
8. **Text Shadows on Headers** — `2px 2px 4px rgba(0,0,0,0.5)` creates embossed effect on parchment text.
9. **No Flat White** — Even the lightest surface is `hsl(40 25% 95%)`. Pure white never appears.
10. **Hover-to-Gold Borders** — Cards transition from border to gold on hover, creating a "gilding" effect.

---

## 16. ANTI-PATTERNS (NEVER DO)

- ❌ `bg-white`, `text-black`, `bg-gray-*` — Use design tokens only
- ❌ `bg-blue-*`, `border-blue-*` — No blue accents anywhere
- ❌ Inter, Poppins, Roboto — Georgia for headings, system for body
- ❌ Purple gradients — Entirely off-palette
- ❌ Flat cards without borders — Always `border-2 border-[hsl(var(--brass))]`
- ❌ Missing decorative corners on featured cards
- ❌ Missing frame border on any page
- ❌ Cold shadows on white backgrounds
- ❌ `variant="default"` buttons in CTA positions — Use brass/leather gradient
- ❌ Exposing API keys in client code — All through edge functions
- ❌ Colored sidebar strips — Replaced by leather header pattern

---

## 17. FORM ELEMENTS

| Element | Border | Focus | Radius |
|---|---|---|---|
| Inputs | `border-[hsl(var(--border))]` | `ring-[hsl(var(--ring))]` (burnt orange) | md (6px) |
| Textareas | Same as inputs, default `rows={4}` | Same | md |
| Labels | `font-semibold text-foreground`, Georgia for section-level | — | — |
| Checkboxes | shadcn `<Checkbox>`, inherits primary | — | — |

---

## 18. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Adjustments |
|---|---|---|
| Mobile | `< 768px` | Single column, `px-4 py-6` |
| Tablet | `md: 768px` | 2-column grids |
| Desktop | `lg: 1024px` | Full layouts |
| Wide | `xl: 1280px` | Max content widths |
| Ultra | `2xl: 1400px` | Container max |

---

## 19. DEPLOYMENT

- **Preview**: Lovable Cloud preview URL
- **Production base path**: `/DiscoveryCharts/` (for GitHub Pages via `vite.config.ts`)
- **GitHub Actions**: `.github/workflows/deploy.yml`
- **404 handling**: `public/404.html` for SPA routing on GitHub Pages

---

## 20. LEGACY / UNUSED FILES

| File | Status |
|---|---|
| `little-sister-6705c220-main/` | Old project snapshot — entire directory is legacy reference, not used in build |
| `src/ekko-ui.css`, `src/ekko-ui-v2.css`, `src/ekko-ui-v3.css`, `src/ekko-ui-labs.css` | Ekko panel stylesheets |
| `src/js/ekko-wiring.js`, `-v2.js`, `-v3.js`, `-labs.js` | Ekko vanilla JS wiring |
| `src/js/safety-helpers.js` | Input sanitization helpers |
| `src/assets/parchment-bg-2.jpg` | Alternate background (available but unused) |
| `src/pages/DevTools.tsx` | Feature checklist page (no route in App.tsx) |
