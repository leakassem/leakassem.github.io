import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import {
  CITIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  STUDIOS,
} from './lib/facets';

/*
  The project content model.

  Every project is one markdown file in `src/content/projects/`, named for its
  slug — `az-triplex.md` is `/work/az-triplex`. No project page is ever
  hand-written; `/work` and `/work/[slug]` are one template each, fed from here.

  The data is `docs/BRIEF.md` §4 verbatim. Nothing in a project file is
  editorial — where a fact isn't in the brief (a completion year, a written
  description), the field is absent rather than invented.

  Anything derivable is derived rather than stored: country comes from city,
  and a project's area and role list come from its sections. See
  `src/lib/projects.ts`. The rule is that no two fields can contradict.
*/

/**
 * A sheet's worth of work: one page of the source portfolio.
 *
 * Projects aren't uniform — AD villa is two sheets covering different rooms
 * with different areas and different roles, while Faqra is one sheet covering
 * the whole chalet. Modelling the sheet rather than flattening to the project
 * is what keeps "70 m² reception" from being lost, and it gives the detail
 * page in step 7 its natural sub-headings.
 */
const section = z.object({
  /** Rooms covered, as the sheet states them. Absent when a sheet covers the whole property. */
  rooms: z.string().optional(),

  /** Square metres she designed. Omit when the area is stated for the project as a whole. */
  area: z.number().positive().optional(),

  /** Only when this part's status differs from the project's — Qatar villa's outdoor. */
  status: z.enum(PROJECT_STATUSES).optional(),

  /**
   * Source PDF page, for tracing images back to their sheet. Provenance only —
   * never a layout or filename input (see the image rules in `CLAUDE.md`) —
   * except that portfolio order falls out of it, which is Lea's own sequence.
   */
  sheet: z.number().int().positive(),

  /** What she did on this part, one bullet per line, as listed on the sheet. */
  role: z.array(z.string()).nonempty(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),

  schema: ({ image }) =>
    z.object({
      title: z.string(),
      studio: z.enum(STUDIOS),
      type: z.enum(PROJECT_TYPES),
      status: z.enum(PROJECT_STATUSES),

      /** Country is derived from this — see CITY_COUNTRY in `src/lib/facets.ts`. */
      city: z.enum(CITIES),
      /** Neighbourhood: Downtown, Ashrafieh, Sin el Fil, Talet al Khayat. */
      district: z.string().optional(),
      /** Named development the property sits in — Sursock Yards, 3Beirut. */
      development: z.string().optional(),

      /** Whole-project area in m². Omit when the sheets state it per section instead. */
      area: z.number().positive().optional(),

      /**
       * Carries the home page's selected work. Six of them, chosen in step 5
       * for the strength of the image and a spread of country, studio and type
       * rather than for floor area. Lea confirms the set — open item 10.
       */
      featured: z.boolean().default(false),

      sections: z.array(section).nonempty(),

      /*
        Images are optional because they don't exist yet: step 4 crops them out
        of the sheets in `src/assets/sheets/`. Paths are `<slug>/<role>` by
        convention, never sheet number or crop coordinates, so swapping in
        Lea's originals later is a file drop rather than a refactor.

        `image()` rather than a string means a broken path fails the build, and
        `astro:assets` gets the dimensions it needs to reserve space.
      */
      hero: z
        .object({
          src: image(),
          alt: z.string(),
        })
        .optional(),

      gallery: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
          }),
        )
        .default([]),
    }),
});

/*
  Bodies are intentionally empty. A project page is metadata, role and images —
  written copy per project would have to come from Lea, and inventing it would
  break the tone rules in `CLAUDE.md`. The body is here for when she supplies
  it; see open item 9 in `work.md`.
*/
export const collections = { projects };
