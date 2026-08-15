# Design & Content Brief — Lea Kassem Portfolio

Everything extracted from the source PDF (25 pages) and CV lives here.
**Do not reopen the source PDF** — it is a flattened raster with no text layer,
and reading it costs ~50k tokens for information already written below.

---

## 1. Who she is

**Lea Kassem** — Senior Interior Architect, based in Beirut, Lebanon.
6+ years delivering residential and commercial interiors across Europe, the UAE,
Qatar and Lebanon. Routinely runs five or more concurrent projects end to end:
concept design → technical documentation → FF&E specification → procurement →
budget control → site delivery, coordinating contractors, joinery, electrical
and mechanical teams throughout.

**Experience**

| Role | Studio | Where | When |
|---|---|---|---|
| Senior Interior Architect | Yafawi Design | Europe | Sep 2025 – present |
| Senior Interior Architect | Step Into Detail | Dubai, UAE / Beirut | Apr 2022 – Aug 2025 |
| Interior Architect | Design in Frame | Beirut | Oct 2020 – Jan 2022 |
| Interior Architect (intern) | Design in Frame | Beirut | Aug – Sep 2020 |
| English–French Teacher | Little Ones Preschool | Beirut | Nov 2018 – Jul 2020 |

**Education** — BA Interior Design *with Honors*, American University of Science
and Technology, Beirut (2014–2018). Lebanese Baccalaureate in Literature &
Humanity, École Sainte-Anne des sœurs de Besançon (2014).

**Skills** — Space planning, project management, cost and budget analysis,
colour theory, material and furniture selection, contractor and supplier
coordination, client presentation.
**Software** — AutoCAD, Adobe Photoshop, Adobe Illustrator, Microsoft Office.
**Languages** — English (fluent), French (fluent), Arabic (native).

> Contact details are deliberately **not** recorded in this repo beyond the email,
> which is an open item. See `work.md`.

---

## 2. Existing visual identity

Carry this forward — it's already good, and it's hers.

- **Ground:** white and a light warm grey (roughly `#E8E8E8`). Almost no colour;
  the work supplies all of it.
- **Structure:** a single thin black vertical rule down the left, with the
  category set vertically alongside it. Large white card floating on the grey.
- **Type:** bold grotesque for the studio name (Helvetica-like, tight, all-caps
  weight contrast), light weight for the project title beneath it. Small caps
  tracking-heavy labels for `PROJECT DETAILS` / `PROJECT ROLE` and the footer
  location.
- **Layout:** hard split — text column left (~⅓), image grid right (~⅔). Very
  generous whitespace. Images butt together in a tight grid with thin white gutters.
- **Format:** pages are 2:1 landscape, which is worth echoing in hero crops.
- **Cover:** name set very large, `PORTFOLIO` vertical, contact bottom-right,
  single black-and-white interior photo bleeding off the right edge.

### Motion language

The identity is quiet and architectural — the animation must be too. Slow,
weighted, precise. No bounce, no spin, no confetti.

- Scroll-driven reveals: image scale from ~1.06 → 1, opacity 0 → 1, long easing
- Text: line-by-line mask reveals on headings, subtle stagger
- Image grids: stagger children ~60–80ms
- Page transitions via Astro view transitions — images should feel continuous
- Slight parallax on hero imagery only; never on body text
- **Every one of these must no-op under `prefers-reduced-motion: reduce`**

---

## 3. Site structure

```
/                    Home — hero, selected work, about teaser, contact
/work                All projects, filterable by type / location / status
/work/[slug]         Project detail — hero, metadata, role, gallery
/about               Bio, experience timeline, skills, education
/contact             Email only (see hard rules in CLAUDE.md)
```

---

## 4. Project inventory

17 distinct projects across 23 sheets. **All residential.** Sheet numbers refer
to pages in the source PDF, for tracing images back only.

Statuses and areas are verbatim from the PDF. Typos in the original
(`apartement`, `electical`, `supervison`) are corrected here.

### Step Into Detail (Dubai / Abu Dhabi, 2022–2025)

**AD villa** — Abu Dhabi, UAE · Residential villa · Completed
- *Reception area* — 70 m² (sheet 2). Role: architecture layout & design;
  design drawings; 2D renders; furniture, materials and tiling selection;
  project moodboards & presentations.
- *Media room, guest bedroom & home office* — 50 m² (sheet 3). Role: furniture
  layout & design; design drawings; electrical drawings; 2D renders; furniture &
  materials selection; project moodboards & presentations.

**DIFC apartment** — Dubai, UAE · Residential apartment · Completed · 270 m²
- *Living room* (sheet 4). Role: furniture layout & design; design drawings;
  2D renders; furniture & materials selection; project moodboards &
  presentations; collaborated with contractor and suppliers.
- *Guest bedroom* (sheet 5) and *Guest toilet* (sheet 6). Role: architectural
  layout & design; design technical drawings; 2D renders; furniture, materials &
  tiling selection; project moodboards & presentations; collaborated with
  contractor and suppliers.
- Note: sheet 6 carries the internal name "THE DIFC PROJECT".

**K1 villa** — Dubai, UAE · Residential villa · Completed · 110 m² (sheet 7)
- *Living, dining & show kitchen.* Role: architectural layout & design; design
  technical drawings; 2D renders; furniture, materials & tiling selection;
  project moodboards & presentations; collaborated with contractor and suppliers.

**FG villa** — Dubai, UAE · Residential villa · Completed · 20 m² (sheet 8)
- *Playing room.* Role: furniture layout & design drawings; 2D renders;
  furniture & materials selection; collaborated with contractor and suppliers.

**VBM villa** — Dubai, UAE · Residential villa · Under construction
- *Living, dining & show kitchen* — 150 m² (sheet 9). Role: indoor architecture
  layout & design; design drawings; furniture selection; lighting, materials and
  tiles selection; project moodboards & presentations; collaborated with the 3D
  designer.
- *Master suite* — 100 m² (sheet 10). Role: architecture layout & design; design
  drawings; 2D renders; electrical drawings; ceiling & lighting drawings;
  furniture, materials and tiling selection; project moodboards & presentations.

### Design in Frame (Lebanon / Qatar, 2020–2022)

**3B apartment** — Downtown Beirut, Lebanon · Residential apartment ·
Under construction · 150 m² (sheet 11)
- Role: indoor and outdoor architecture layout & design; design drawings & PSD
  perspective renders; furniture selection & customisation; lighting, materials
  and tiles selection; project moodboards & presentations; collaborated with 3D
  designer.

**AZ triplex** — Baabda, Lebanon · Residential triplex · Completed · 370 m²
- *Living, dining & outdoor* (sheet 12) and *Bedrooms* (sheet 13). Role: indoor
  and outdoor layout & design; design drawings; furniture selection &
  customisation; lighting, materials, colour and tiles selection; project
  moodboards & presentations; collaborated with the 3D designer.

**Qatar villa** — Doha, Qatar · Residential villa · 700 m²
- *Living and dining room* — Completed (sheet 14). Role: villa interior layout &
  design; design drawings; furniture selection & customisation; materials,
  lighting & colour selection; project moodboards & presentations.
- *Outdoor* — outdoor under construction (sheet 15). Same role, plus
  collaborated with the 3D designer.

**8B2 studio apartment** — Sursock Yards, Ashrafieh, Lebanon · Studio apartment ·
Completed · 90 m² (sheet 16)
- *Living, dining & kitchen.* Role: studio interior layout and design; design
  drawings & PSD perspective renders; materials, lighting & colour selection;
  site supervision.

**B11 apartment** — Downtown Beirut, Lebanon · Residential apartment ·
Completed · 110 m² (sheet 17)
- *Living room & outdoor.* Role: apartment interior & outdoor layout; design
  drawings and 2D renders; unit customisation; materials and colour selection;
  project moodboards & presentations; site supervision.

**3BF apartment** — Downtown Beirut (3Beirut), Lebanon · Residential apartment ·
Completed · 230 m² (sheet 18)
- Role: apartment interior layout & design; design drawings & PSD perspective
  renders; furniture selection & customisation; materials, lighting & colour
  selection; project moodboards & presentations; site supervision; collaborated
  with the 3D designer.

**MMA apartment** — Beirut, Lebanon · Residential apartment · Completed ·
160 m² (sheet 19)
- *Reception area.* Role: interior layout; design & electrical drawings;
  furniture selection & customisation; materials, tiles, lighting and colour
  selection; project moodboards & presentations.

**Faqra club duplex chalet** — Faqra, Lebanon · Chalet · Completed ·
120 m² (sheet 20)
- Role: interior layout & design; design drawings & PSD perspective renders;
  materials, lighting & colour selection; project moodboards & presentations;
  site supervision; collaborated with the 3D designer.

**Vacation house** — Byblos, Lebanon · Residential house · Under construction ·
240 m² (sheet 21)
- Role: interior & outdoor layout; design & electrical drawings; furniture
  selection & customisation; materials, tiles, lighting and colour selection;
  project moodboards & presentations; site supervision.

**MN apartment** — Talet al Khayat, Lebanon · Residential apartment ·
Under construction · 40 m² (sheet 22)
- *Teens bedrooms.* Role: interior and electrical layout; design drawings and 2D
  renders; furniture selection & customisation; lighting, materials and colour
  selection; project moodboards & presentations.

**JCL apartment** — Sin el Fil, Lebanon · Residential apartment · Completed ·
32 m² (sheet 23)
- *Teens bedrooms.* Role: interior and electrical layout; design drawings;
  furniture selection & customisation; lighting & materials selection; project
  moodboards & presentations.

**RJ apartment** — Ashrafieh, Lebanon · Residential apartment · Completed ·
60 m² (sheet 24)
- *Shelving unit.* Role: interior layout & design; design drawings; furniture
  customisation; materials & colour selection; project moodboards &
  presentations; site supervision.

---

## 5. Filter facets

Derived from the inventory above, for `/work`:

- **Type** — villa, apartment, triplex, studio, chalet, house
- **Location** — Dubai, Abu Dhabi, Doha, Beirut (Downtown, Ashrafieh, Sin el Fil,
  Talet al Khayat), Baabda, Byblos, Faqra
- **Status** — completed, under construction
- **Studio** — Step Into Detail, Design in Frame

Country grouping is the more useful top-level cut: **UAE · Qatar · Lebanon**.

---

## 6. Images — the real constraint

The source PDF is 25 flattened raster pages at ~150 DPI. There is no vector, no
text layer, and no separable image layers. Each sheet is a single composite JPEG
around 2475 × 1239 px containing 4–6 individual photos, so a photo cropped out
lands at roughly **600–900 px wide**.

That is acceptable for a grid card and **too small for a full-bleed hero.**

**Preferred source:** Lea's original render and site-photo files — the folder she
assembled the Illustrator layouts from. Those will be 2000–4000 px. This is an
open item in `work.md` and is the highest-value thing to obtain.

**Fallback:** crop ~110 photos out of the page composites. Usable at card size,
marginal at hero size. If this path is taken, design the hero around a 2:1 crop
of the single strongest image per project rather than full-bleed.

Total across all sheets: roughly 110–130 individual photos and drawings, a mix
of site photography, 3D renders, elevations, and floor plans. The elevations and
plans are worth showing — they evidence the technical side of her work, which is
what separates her from a decorator.
