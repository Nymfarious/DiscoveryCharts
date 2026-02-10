# DiscoveryCharts — Complete Style Guide

> **Theme**: Vintage Cartographer / Explorer's Desk  
> **Aesthetic**: Aged parchment, brass instruments, leather-bound journals  
> **Font Stack**: Georgia (serif) for display, system sans for body, system mono for coordinates

---

## 1. Color System (HSL Tokens)

All colors are defined as CSS custom properties in `src/index.css` using HSL values.

### Light Mode

| Token | HSL Value | Hex Approx. | Usage |
|---|---|---|---|
| `--background` | `40 25% 95%` | `#f5f0e8` | Page background |
| `--foreground` | `30 20% 20%` | `#3d3329` | Body text |
| `--card` | `42 30% 92%` | `#efe6d6` | Card surfaces |
| `--card-foreground` | `30 20% 20%` | `#3d3329` | Card text |
| `--popover` | `42 30% 90%` | `#e8dece` | Dropdowns, tooltips |
| `--primary` | `28 70% 45%` | `#c26a22` | Burnt orange CTA |
| `--primary-foreground` | `42 30% 95%` | `#f5ede0` | Text on primary |
| `--secondary` | `35 40% 75%` | `#d4bf9e` | Tan accents |
| `--muted` | `40 20% 85%` | `#ded6ca` | Subtle backgrounds |
| `--muted-foreground` | `30 10% 40%` | `#6e665e` | Secondary text |
| `--accent` | `28 60% 60%` | `#d98c4f` | Warm amber |
| `--destructive` | `0 70% 50%` | `#d93636` | Error / danger |
| `--border` | `35 25% 75%` | `#cdbfa8` | Borders |
| `--input` | `35 25% 80%` | `#d9cdb8` | Input borders |
| `--ring` | `28 70% 45%` | `#c26a22` | Focus rings |

### Vintage Additions

| Token | HSL Value | Hex Approx. | Usage |
|---|---|---|---|
| `--parchment` | `40 35% 88%` | `#e8dcc4` | Aged paper background |
| `--parchment-dark` | `38 30% 78%` | `#d2c4a8` | Darker parchment |
| `--gold` | `45 90% 55%` | `#ebc11a` | Gold accents, highlights |
| `--brass` | `40 50% 45%` | `#ac8a39` | Brass metallic accents |
| `--leather` | `25 40% 30%` | `#6b4d2e` | Dark leather brown |

### Dark Mode

| Token | HSL Value | Hex Approx. | Usage |
|---|---|---|---|
| `--background` | `30 15% 12%` | `#231e19` | Dark bg |
| `--foreground` | `40 25% 88%` | `#e8dcc4` | Light text |
| `--card` | `30 20% 18%` | `#372e24` | Dark card |
| `--primary` | `45 90% 55%` | `#ebc11a` | Gold CTA |
| `--gold` | `45 90% 60%` | `#edc93d` | Brighter gold |
| `--brass` | `40 60% 50%` | `#cc9933` | Brighter brass |
| `--leather` | `25 30% 18%` | `#3b2e20` | Deep leather |

---

## 2. Typography

| Role | Font | Style | Where Used |
|---|---|---|---|
| **Display / Title** | `Georgia, serif` | Bold, 2xl–4xl | Page titles, card headings, branding |
| **Body** | System sans (Tailwind default) | Regular, sm–base | Paragraphs, labels, descriptions |
| **Monospace** | System mono | Regular, xs–sm | Coordinates, code, DZI paths |

### Application

```tsx
// Display headings
<h1 style={{ fontFamily: 'Georgia, serif' }}>Title</h1>

// Body text — no override needed (uses Tailwind defaults)
<p className="text-sm text-muted-foreground">Description</p>
```

---

## 3. Spacing & Layout

| Property | Value | Notes |
|---|---|---|
| **Border Radius** | `--radius: 0.5rem` | Applied via `rounded-lg` |
| **Page Padding** | `p-6 md:p-8` | Responsive |
| **Max Widths** | `max-w-7xl` (workspace), `max-w-4xl` (chat), `max-w-3xl` (profile) | Centered with `mx-auto` |
| **Card Gap** | `gap-4` to `gap-6` | Between cards in grids |
| **Header Height** | `py-4` to `py-6` | Leather gradient header |

---

## 4. Decorative Elements

### Antique Frame Border
Every page has this fixed overlay:
```tsx
<div className="fixed inset-0 pointer-events-none border-8 border-double opacity-30 z-50" 
     style={{ borderColor: 'hsl(var(--brass))' }} />
```

### Page Background Gradient
```css
background: linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%);
background-attachment: fixed;
```

### Leather Header Bar
```css
background: linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3));
box-shadow: 0 4px 12px rgba(0,0,0,0.3);
border-bottom: 2px solid hsl(var(--brass));
```

### Decorative Corners (Cards)
```tsx
<div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[hsl(var(--brass))] opacity-40" />
<div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[hsl(var(--brass))] opacity-40" />
```

### Gold Admin Badge
```tsx
<div className="px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(var(--gold))] to-yellow-600 
              border border-yellow-800 shadow-md">
  <span className="text-xs font-bold text-[hsl(var(--leather))]">ADMIN</span>
</div>
```

---

## 5. Button Variants

Defined in `src/components/ui/button.tsx`:

| Variant | Appearance | Use Case |
|---|---|---|
| `default` | Brass-to-leather gradient, 3D shadow | Standard CTA |
| `brass` | Gold-to-brass gradient, uppercase tracking | Primary action (load map, save) |
| `steel` | Cool gray gradient, uppercase | Secondary action (cloud download) |
| `outline` | Brass border, parchment bg | Tertiary / navigation |
| `secondary` | Parchment gradient | Less prominent actions |
| `ghost` | Transparent, hover parchment tint | Icon buttons, minimal |
| `destructive` | Red gradient, 3D shadow | Delete / danger |
| `link` | Underline on hover | Inline links |

### Sizes
| Size | Tailwind | Notes |
|---|---|---|
| `sm` | `h-9 px-4 text-xs` | Compact actions |
| `default` | `h-10 px-6` | Standard |
| `lg` | `h-12 px-10 text-base` | Hero CTA |
| `icon` | `h-10 w-10` | Square icon button |

---

## 6. Card Patterns

### Standard Card
```tsx
<Card className="border-2 border-[hsl(var(--brass))] shadow-xl bg-[hsl(var(--card))]">
  <CardHeader className="border-b border-[hsl(var(--border))]">
    <CardTitle style={{ fontFamily: 'Georgia, serif' }}>Title</CardTitle>
    <CardDescription className="italic">Description</CardDescription>
  </CardHeader>
  <CardContent className="pt-6">
    {/* content */}
  </CardContent>
</Card>
```

### Interactive Card (nav)
```tsx
<div className="p-8 bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] 
              rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 
              hover:scale-105 hover:border-[hsl(var(--gold))]"
     style={{ 
       background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--parchment-dark)) 100%)',
       boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
     }}>
```

---

## 7. Page Layout Template

```
┌──────────────────────────────────────────────┐
│  Fixed decorative border (brass, z-50)       │
│  ┌────────────────────────────────────────┐  │
│  │  Leather gradient header               │  │
│  │  Logo + Title | Settings/Nav           │  │
│  ├────────────────────────────────────────┤  │
│  │  Main content area                     │  │
│  │  max-w-Xll mx-auto p-6 md:p-8        │  │
│  │  Parchment gradient background         │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Header Variants

1. **Leather header** (Index, History, Workspace, Profile):
   - Dark leather gradient with parchment-colored text
   - Brass bottom border with shadow

2. **Sticky header** (Chat, ChatHistory, Ekko):
   - `sticky top-0 backdrop-blur-sm bg-card/95`
   - Brass bottom border

---

## 8. Icon Library

Uses **lucide-react** exclusively.

### Navigation
`MapPin`, `Home`, `ArrowLeft`, `LogIn`, `LogOut`

### Actions  
`Upload`, `Download`, `Save`, `Trash2`, `Copy`, `Plus`

### Status
`Shield`, `Eye`, `EyeOff`, `Loader2` (spinner), `CheckCircle`, `Circle`

### Content
`MessageSquare`, `History`, `Mic`, `Volume2`, `Play`, `Square`

### Dev
`Code2`, `Map`, `Library`, `Calendar`, `Crosshair`

---

## 9. Animation & Transitions

| Effect | CSS | Duration | Use Case |
|---|---|---|---|
| Card hover | `transition-all duration-300` | 300ms | Nav cards, interactive items |
| Scale up | `hover:scale-105` | 200ms (via transition-transform) | Nav cards |
| Icon scale | `hover:scale-110` | 200ms | Icon buttons, theme swatches |
| Spinner | `animate-spin` | continuous | Loader2 icon |
| Fade in | `animate-fade-in` | 300ms | Modals, overlays |
| Accordion | `animate-accordion-down` | 200ms | Collapsible content |

---

## 10. Background Assets

| File | Usage | Notes |
|---|---|---|
| `src/assets/parchment-bg-1.jpg` | `body` background via CSS | `background-size: cover; background-attachment: fixed` |
| `src/assets/parchment-bg-2.jpg` | Unused (alternate) | Available for dark mode or section variation |

---

## 11. Tab Styling

```tsx
<TabsList className="grid w-full mb-6 bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))]">
  <TabsTrigger 
    className="data-[state=active]:bg-[hsl(var(--gold))] data-[state=active]:text-[hsl(var(--leather))]"
  >
    <Icon className="w-4 h-4" /> Label
  </TabsTrigger>
</TabsList>
```

---

## 12. Form Elements

### Input
```tsx
<Input className="border-[hsl(var(--border))]" />
```

### Disabled Input
```tsx
<Input className="bg-[hsl(var(--muted))] cursor-not-allowed border-[hsl(var(--border))]" disabled />
```

### Info Box
```tsx
<div className="bg-[hsl(var(--muted))] rounded-lg p-4 text-sm border border-[hsl(var(--border))]">
  <AlertCircle className="w-4 h-4 text-[hsl(var(--brass))]" />
  <p className="text-xs text-muted-foreground">Info text</p>
</div>
```

---

## 13. Pages with Inconsistent Styling

These pages use an older style (colored sidebar strip, no vintage theme):

- `/tell-me` (TellMe)
- `/prove-it` (ProveIt)  
- `/family-tree` (FamilyTree)
- `/preferences` (Preferences) — uses sticky header variant

**Recommendation**: Update to use the standard vintage page layout template with leather header, brass frame border, and parchment gradient background.

---

## 14. Z-Index Stack

| Layer | z-index | Element |
|---|---|---|
| Decorative frame | `z-50` | Fixed brass border |
| Dev panel | `z-50` | Bottom sheet overlay |
| Dev panel backdrop | `z-40` | Semi-transparent overlay |
| Dev toggle button | `z-30` | Fixed bottom-left FAB |
| Sticky header | `z-20` | Chat/History headers |
| Dropdowns | `z-20` | Settings menu |
| Content | default | Page content |

---

## 15. Shadow Patterns

| Name | Value | Usage |
|---|---|---|
| Header shadow | `0 4px 12px rgba(0,0,0,0.3)` | Leather header bar |
| Card shadow | Tailwind `shadow-xl` | Primary cards |
| Dropdown shadow | `0 8px 24px rgba(0,0,0,0.4)` | Settings menu |
| Button 3D | `0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)` | Brass/default buttons |
| Dev button glow | `0 0 30px rgba(218,165,32,0.5)` | Dev tools FAB hover |
