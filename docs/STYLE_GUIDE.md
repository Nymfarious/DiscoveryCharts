# DiscoveryCharts — Vintage Cartographer Design System
## Complete Style Guide v2.0

> This document defines every visual decision that makes DiscoveryCharts look and feel like an antique explorer's study. Follow it exactly to replicate the aesthetic in any new page, component, or fork.

---

## 1. DESIGN PHILOSOPHY

**Theme Name:** Vintage Cartographer  
**Mood:** An 18th-century mapmaker's private study — warm parchment paper, brass instruments, leather-bound journals, gold-leaf accents.  
**Personality:** Scholarly, warm, tactile, trustworthy. Never cold, never clinical.  
**What makes it different:** While most web apps use flat whites, blues, and Inter font, DiscoveryCharts feels like opening a physical artifact. Every surface has weight and age.

---

## 2. COLOR SYSTEM (HSL — All Values)

### 2.1 Light Mode Tokens

| Token | HSL Value | Hex Approx | Usage |
|---|---|---|---|
| `--background` | `40 25% 95%` | `#f5f0e8` | Page fallback (under gradient) |
| `--foreground` | `30 20% 20%` | `#3d3428` | Primary text |
| `--card` | `42 30% 92%` | `#efe8d8` | Card surfaces, panels |
| `--card-foreground` | `30 20% 20%` | `#3d3428` | Text on cards |
| `--popover` | `42 30% 90%` | `#e8dfc8` | Dropdown/popover surfaces |
| `--popover-foreground` | `30 20% 20%` | `#3d3428` | Text in popovers |
| `--primary` | `28 70% 45%` | `#c2682a` | Burnt orange — CTA emphasis |
| `--primary-foreground` | `42 30% 95%` | `#f5efe3` | Text on primary buttons |
| `--secondary` | `35 40% 75%` | `#d4c3a0` | Tan — secondary surfaces |
| `--secondary-foreground` | `30 20% 20%` | `#3d3428` | Text on secondary |
| `--muted` | `40 20% 85%` | `#ddd6c8` | Disabled/subtle backgrounds |
| `--muted-foreground` | `30 10% 40%` | `#6b6158` | Subtle text, timestamps |
| `--accent` | `28 60% 60%` | `#d4884a` | Warm amber — hover highlights |
| `--accent-foreground` | `30 20% 20%` | `#3d3428` | Text on accent |
| `--destructive` | `0 70% 50%` | `#d93636` | Delete/danger red |
| `--destructive-foreground` | `42 30% 95%` | `#f5efe3` | Text on destructive |
| `--border` | `35 25% 75%` | `#c9b99a` | General borders |
| `--input` | `35 25% 80%` | `#d4c8ae` | Input field borders |
| `--ring` | `28 70% 45%` | `#c2682a` | Focus ring (matches primary) |

### 2.2 Custom Vintage Tokens

| Token | HSL Value | Hex Approx | Usage |
|---|---|---|---|
| `--parchment` | `40 35% 88%` | `#e8dcc0` | Page gradient start, header text |
| `--parchment-dark` | `38 30% 78%` | `#d1c2a0` | Page gradient end |
| `--gold` | `45 90% 55%` | `#e8c420` | Gold leaf — badges, icon backgrounds, hover states |
| `--brass` | `40 50% 45%` | `#ab8c36` | Antique brass — borders, decorative corners, links |
| `--leather` | `25 40% 30%` | `#6b4a2e` | Dark brown — header gradient, button text |

### 2.3 Dark Mode Tokens

| Token | HSL Value | Hex Approx | Usage |
|---|---|---|---|
| `--background` | `30 15% 12%` | `#231e18` | Deep brown base |
| `--foreground` | `40 25% 88%` | `#e8dcc0` | Cream text |
| `--card` | `30 20% 18%` | `#372d22` | Card surfaces |
| `--primary` | `45 90% 55%` | `#e8c420` | Gold becomes primary |
| `--primary-foreground` | `30 15% 12%` | `#231e18` | Dark text on gold |
| `--muted` | `30 15% 25%` | `#4a3d2e` | Muted dark surfaces |
| `--muted-foreground` | `40 15% 65%` | `#b3a488` | Muted text |
| `--accent` | `40 50% 45%` | `#ab8c36` | Brass accent |
| `--gold` | `45 90% 60%` | `#ebc82a` | Slightly brighter gold |
| `--brass` | `40 60% 50%` | `#cc9e33` | Brighter brass |
| `--leather` | `25 30% 18%` | `#3a2e22` | Darker leather |
| `--parchment` | `30 20% 22%` | `#42362a` | Dark parchment |
| `--parchment-dark` | `30 20% 15%` | `#2e251c` | Darkest parchment |

### 2.4 Sidebar Tokens (both modes defined in index.css)

Follow the same warm palette. Light uses cream/brass; dark uses deep brown/gold.

---

## 3. TYPOGRAPHY

### 3.1 Font Stack

| Role | Font | Fallback | Where Used |
|---|---|---|---|
| **Display / Headings** | Georgia | serif | Page titles (`h1`), card titles, hero text, section headers |
| **Body** | System UI | Tailwind sans stack | Paragraphs, labels, form text, descriptions |
| **Monospace** | System mono | Tailwind mono stack | Coordinates, code snippets, debug info |

### 3.2 Application Rules

```css
/* Headings — always Georgia */
style={{ fontFamily: 'Georgia, serif' }}

/* Page title */
text-2xl font-bold tracking-wide
textShadow: '2px 2px 4px rgba(0,0,0,0.5)' /* on leather headers only */

/* Section titles inside cards */
text-xl font-semibold   /* Georgia */

/* Card descriptions */
text-muted-foreground   /* system font, regular weight */

/* Hero/welcome text */
text-4xl font-bold      /* Georgia */
```

### 3.3 Text Colors

| Context | Class |
|---|---|
| Normal body text | `text-foreground` |
| Subtle/secondary text | `text-muted-foreground` |
| Text on leather header | `text-[hsl(var(--parchment))]` |
| Text on brass/gold buttons | `text-[hsl(var(--leather))]` |
| Decorative subtitles | `text-[hsl(var(--parchment))]/70` (70% opacity) |
| Links | `text-[hsl(var(--brass))]` with `hover:text-[hsl(var(--gold))]` |

---

## 4. LAYOUT PATTERNS

### 4.1 Page Shell (Required on Every Page)

```tsx
<div className="min-h-screen" style={{
  background: 'linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%)',
  backgroundAttachment: 'fixed'
}}>
  {/* 1. Decorative frame border */}
  <div className="fixed inset-0 pointer-events-none border-8 border-double opacity-40 z-50"
       style={{ borderColor: 'hsl(var(--brass))' }} />

  {/* 2. Leather header bar */}
  <div className="relative border-b-2 border-[hsl(var(--brass))] shadow-lg"
       style={{
         background: 'linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3))',
         boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
       }}>
    <div className="px-8 py-6 flex items-center gap-4">
      {/* Back button + icon + title */}
    </div>
  </div>

  {/* 3. Content area */}
  <div className="px-8 py-10 max-w-{size} mx-auto">
    {/* Page content */}
  </div>
</div>
```

### 4.2 Max-Width by Page Type

| Page Type | Max Width | Examples |
|---|---|---|
| Dashboard | `max-w-6xl` | Index |
| Form / Single column | `max-w-4xl` | TellMe, ProveIt, Chat, Profile, Preferences |
| Multi-column workspace | `max-w-7xl` | Workspace, History |
| Tree / visualization | `max-w-5xl` | FamilyTree |
| Full-width tool | No max | GIS Viewer, Overlay Creator |

### 4.3 Content Spacing

- Page padding: `px-8 py-10`
- Card internal padding: `p-6`
- Section gaps: `space-y-6` or `mb-6`
- Grid gaps: `gap-4` to `gap-6`

---

## 5. COMPONENT PATTERNS

### 5.1 Leather Header Bar

Every page has this exact header pattern:

```
Background: linear-gradient(to bottom, leather → brass/0.3)
Box shadow: 0 4px 12px rgba(0,0,0,0.3)
Bottom border: 2px solid brass
Text color: parchment
Text shadow: 2px 2px 4px rgba(0,0,0,0.5)
Font: Georgia, serif
```

**Header icon badge** (gold circle with icon):
```tsx
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--brass))]
                flex items-center justify-center shadow-lg">
  <IconName className="w-5 h-5 text-[hsl(var(--leather))]" />
</div>
```

**Back button** (on sub-pages):
```tsx
<Button variant="ghost" asChild className="text-[hsl(var(--parchment))] hover:bg-white/10">
  <Link to="/" className="flex items-center gap-2">
    <ArrowLeft className="w-5 h-5" /> Dashboard
  </Link>
</Button>
```

### 5.2 Card Pattern

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

Corner sizes:
- **Featured cards**: `w-8 h-8`, `border-2`, `opacity-40`
- **List items**: `w-5 h-5`, `border` (1px), `opacity-30`
- **Stat cards**: `w-4 h-4`, `border`, `opacity-30`

### 5.3 Hoverable List Item

```tsx
<div className="relative p-4 bg-[hsl(var(--card))] rounded-lg border-2 border-[hsl(var(--border))]
                hover:border-[hsl(var(--gold))] cursor-pointer transition-all duration-300
                hover:shadow-lg hover:scale-[1.01]"
     style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
```

### 5.4 Navigation Card (Dashboard)

```
Background: gradient from card to parchment-dark
Border: 2px border, hover → gold
Shadow: 4px 12px rgba(0,0,0,0.2), hover → shadow-2xl
Scale: hover:scale-105
Icon container: rounded-full with dark gradient (amber-700→amber-900 or stone-700→stone-900)
Decorative corners: 8×8, border-2, brass, opacity-40
Title font: Georgia, serif
```

### 5.5 Decorative Frame Border

Present on every page, always `z-50`, always `pointer-events-none`:
```tsx
<div className="fixed inset-0 pointer-events-none border-8 border-double opacity-40 z-50"
     style={{ borderColor: 'hsl(var(--brass))' }} />
```

### 5.6 Sticky Header (Chat / Ekko variant)

For pages with scrollable content and a fixed top bar:
```
sticky top-0 backdrop-blur-sm bg-card/95 border-b border-border z-10
```
Still uses Georgia serif for the title.

---

## 6. BUTTON SYSTEM

### 6.1 Brass Button (Primary CTA)

```tsx
<Button className="bg-gradient-to-r from-[hsl(var(--brass))] to-[hsl(var(--gold))]
                   text-[hsl(var(--leather))] font-bold hover:opacity-90
                   border border-[hsl(var(--leather))]">
```

### 6.2 Leather Button (Secondary CTA)

```tsx
<Button className="bg-gradient-to-r from-[hsl(var(--leather))] to-[hsl(var(--brass))]
                   text-[hsl(var(--parchment))] font-bold hover:opacity-90">
```

### 6.3 Ghost Button (Header navigation)

```tsx
<Button variant="ghost" className="text-[hsl(var(--parchment))] hover:bg-white/10">
```

### 6.4 Admin Badge

```tsx
<div className="px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-yellow-600
                border border-yellow-800 shadow-md">
  <span className="text-xs font-bold text-[hsl(var(--leather))]">ADMIN</span>
</div>
```

### 6.5 Dev Tools FAB

```tsx
<button className="fixed bottom-6 left-6 z-30 p-4 rounded-full
                   bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--brass))]
                   shadow-2xl hover:scale-110 transition-all duration-200
                   border-2 border-[hsl(var(--leather))]
                   hover:shadow-[0_0_30px_rgba(218,165,32,0.5)]">
```

---

## 7. SHADOWS & DEPTH

| Level | Value | Usage |
|---|---|---|
| Subtle | `0 2px 8px rgba(0,0,0,0.1)` | List items, inputs |
| Card | Tailwind `shadow-xl` | Cards, panels |
| Header | `0 4px 12px rgba(0,0,0,0.3)` | Leather header bar |
| Dropdown | `0 8px 24px rgba(0,0,0,0.4)` | Popovers, floating menus |
| Elevated | Tailwind `shadow-2xl` | Hovered cards, FAB |
| Glow (dev) | `0 0 30px rgba(218,165,32,0.5)` | Dev tools button hover |

---

## 8. BORDER RADIUS

| Token | Value | Usage |
|---|---|---|
| `--radius` (lg) | `0.5rem` (8px) | Cards, panels, buttons |
| md | `calc(0.5rem - 2px)` = 6px | Inputs, smaller elements |
| sm | `calc(0.5rem - 4px)` = 4px | Badges, tags |
| Full | `rounded-full` | Avatars, icon circles, FAB |

---

## 9. ICONS

**Library:** `lucide-react` (exclusively)

### Icon Sizing

| Context | Size | Example |
|---|---|---|
| Header icon badge | `w-5 h-5` or `w-6 h-6` | Inside gold circle |
| Inline with text | `w-4 h-4` | Button icons |
| Navigation card icon | `w-8 h-8` | Dashboard nav cards |
| Standalone large | `w-12 h-12` | Empty states |

### Key Icons by Feature

| Feature | Icon |
|---|---|
| Maps / Navigation | `MapPin`, `Map` |
| Chat / AI | `MessageSquare` |
| Settings | `Settings` |
| Profile | `User` |
| Admin | `Shield` |
| Upload | `Upload` |
| Download | `Download` |
| Delete | `Trash2` |
| Search | `Search` |
| Back | `ArrowLeft` |
| Loading | `Loader2` (with `animate-spin`) |
| Dev Tools | `Code2` |
| Voice | `Mic`, `Volume2`, `Play`, `Square` |
| Family Tree | `TreePine`, `Users`, `UserPlus` |
| Story/Tell Me | `BookOpen` |
| Fact Check | `Search` |
| History | `History` |
| Eye/View | `Eye`, `EyeOff` |

---

## 10. ANIMATION & TRANSITIONS

| Element | Animation | Duration |
|---|---|---|
| Card hover | `transition-all` | `300ms` |
| Nav card scale | `hover:scale-105` | `300ms` |
| List item scale | `hover:scale-[1.01]` | `300ms` |
| Theme swatch | `hover:scale-110` | `200ms` |
| FAB hover | `hover:scale-110` | `200ms` |
| Accordion | `accordion-down/up` | `200ms ease-out` |
| Spinner | `animate-spin` | continuous |
| Border color | `transition-colors` | `300ms` (on hover:border-gold) |

---

## 11. BACKGROUNDS

### 11.1 Page Gradient (primary method)

```css
background: linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%);
background-attachment: fixed;
```

### 11.2 Body Background Image (fallback layer)

```css
body {
  background-image: url('/src/assets/parchment-bg-1.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
}
```

Asset: `src/assets/parchment-bg-1.jpg` — warm, aged paper texture  
Alternate: `src/assets/parchment-bg-2.jpg` — available but unused

### 11.3 Header Gradient

```css
background: linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3));
```

### 11.4 Card Gradient (nav cards)

```css
background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--parchment-dark)) 100%);
```

---

## 12. FORM ELEMENTS

### Inputs

```
Border: border-[hsl(var(--border))]
Background: inherits from card or background
Focus ring: ring-[hsl(var(--ring))] (burnt orange)
Border radius: md (6px)
```

### Textareas

Same as inputs. Use `rows={4}` as default.

### Labels

```
font-semibold text-foreground
Georgia serif for section-level labels
System font for field-level labels
```

### Checkboxes

Use shadcn `<Checkbox>`. No color overrides needed — inherits from primary.

---

## 13. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Usage |
|---|---|---|
| Mobile | `< 768px` | Single column, reduced padding (`px-4 py-6`) |
| Tablet | `md: 768px` | 2-column grids, standard padding |
| Desktop | `lg: 1024px` | Full layouts |
| Wide | `xl: 1280px` | Max content widths |
| Ultra | `2xl: 1400px` | Container max |

---

## 14. Z-INDEX STACK

| Layer | Z-Index | Element |
|---|---|---|
| Content | 0 | Normal page flow |
| Sticky headers | 10 | Chat/Ekko sticky bars |
| Sidebar overlays | 20 | Settings dropdown, popovers |
| Dev tools FAB | 30 | Fixed bottom-left button |
| Decorative frame | 50 | `border-double` frame overlay |
| Modals/dialogs | 50+ | shadcn Dialog (auto-managed) |

---

## 15. WHAT MAKES THIS DIFFERENT

### Visual Signatures (The "Face" of the App)

1. **The Brass Double-Frame Border** — A fixed `border-8 border-double` overlay at `z-50` on every page. No other web app does this. It makes every screen feel like looking through an antique picture frame.

2. **Leather-to-Brass Header Gradient** — The dark `hsl(25 40% 30%)` → `hsl(40 50% 45%/0.3)` gradient with a brass bottom border is the app's signature header bar. It reads as a leather bookbinding.

3. **Gold Icon Badges** — Every page header has a rounded gold-to-brass gradient circle holding a lucide icon in leather brown. This is the "seal" motif.

4. **Decorative Corner Brackets** — L-shaped brass borders in card corners (top-right and bottom-left) at 30-40% opacity. Evokes cartographic map borders and certificate framing.

5. **Parchment Gradient Background** — The diagonal gradient from warm cream (`88%` lightness) to darker parchment (`78%`) gives every page a sense of depth without using an image.

6. **Georgia Serif Headings** — While nearly every modern app uses geometric sans-serif, DiscoveryCharts uses Georgia for all titles, creating an immediate "historical document" feel.

7. **Warm Brown-Gold Palette** — The entire color system lives in the 25°–45° hue range (orange-amber-gold), with no blue or purple anywhere. This is extremely rare in web design and creates instant recognition.

8. **Text Shadows on Headers** — `2px 2px 4px rgba(0,0,0,0.5)` on parchment-colored text over leather backgrounds creates an embossed/debossed effect.

9. **No Flat White** — Even the lightest surface is `hsl(40 25% 95%)`, a warm off-white. Pure white (`#fff`) never appears.

10. **Hover-to-Gold Borders** — Cards transition from `border-[hsl(var(--border))]` to `border-[hsl(var(--gold))]` on hover, creating a "gilding" effect.

---

## 16. ANTI-PATTERNS (Never Do This)

- ❌ `bg-white`, `text-black`, `bg-gray-*` — Use design tokens only
- ❌ `bg-blue-50`, `border-blue-200` — No blue accents (use brass/gold)
- ❌ Inter, Poppins, Roboto — Use Georgia for headings
- ❌ Purple gradients — Entirely off-palette
- ❌ Flat cards without borders — Always use `border-2 border-[hsl(var(--brass))]`
- ❌ Missing decorative corners on featured cards
- ❌ Missing frame border on any page
- ❌ Cold shadows (`rgba(0,0,0,0.1)` on white) — Use warm dark shadows
- ❌ `variant="default"` buttons in CTA positions — Use brass/leather gradient
- ❌ Colored sidebar strips (old pattern from TellMe/ProveIt) — Replaced by leather header

---

## 17. CHECKLIST FOR NEW PAGES

- [ ] Page shell with parchment gradient background
- [ ] Fixed brass double-frame border (`z-50`)
- [ ] Leather header with gold icon badge and Georgia title
- [ ] Back button (ghost variant, parchment text)
- [ ] Content in centered `max-w-*` container with `px-8 py-10`
- [ ] Cards use `border-2 border-[hsl(var(--brass))]` with decorative corners
- [ ] Buttons use brass-to-gold or leather-to-brass gradients
- [ ] Links use `text-[hsl(var(--brass))]` with `hover:text-[hsl(var(--gold))]`
- [ ] Georgia serif on all headings
- [ ] No raw color classes — only design tokens
- [ ] Hover states: border → gold, scale 1.01–1.05, shadow increase
- [ ] Dark mode tested (tokens auto-switch)
