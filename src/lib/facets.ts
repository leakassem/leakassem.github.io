/**
 * Controlled vocabularies for project data — the facets in `docs/BRIEF.md` §5.
 *
 * This file is the single source of truth for them: `src/content.config.ts`
 * builds its zod enums from these arrays, so a typo in a project's frontmatter
 * fails the build rather than quietly creating an 18th "villas" filter.
 *
 * Reaches for nothing but `./cv`, which is import-free for the same reason
 * this module is: `content.config.ts` is loaded in its own context, so
 * anything it reaches for must not drag `astro:content` in with it — the
 * helpers that do live in `src/lib/projects.ts`.
 */

import { yearsAt } from './cv';

/* --------------------------------------------------------------------- type */

export const PROJECT_TYPES = [
  'villa',
  'apartment',
  'triplex',
  'studio',
  'chalet',
  'house',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Singular for a metadata line, plural for a filter chip. */
export const TYPE_LABELS: Record<ProjectType, { one: string; many: string }> = {
  villa: { one: 'Villa', many: 'Villas' },
  apartment: { one: 'Apartment', many: 'Apartments' },
  triplex: { one: 'Triplex', many: 'Triplexes' },
  studio: { one: 'Studio', many: 'Studios' },
  chalet: { one: 'Chalet', many: 'Chalets' },
  house: { one: 'House', many: 'Houses' },
};

/* ------------------------------------------------------------------- status */

export const PROJECT_STATUSES = ['completed', 'under construction'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: 'Completed',
  'under construction': 'Under construction',
};

/* ----------------------------------------------------------------- location */

export const COUNTRIES = ['UAE', 'Qatar', 'Lebanon'] as const;

export type Country = (typeof COUNTRIES)[number];

/**
 * Every city in the inventory, mapped to its country.
 *
 * Country is *derived* from city and never stored on a project — one fact in
 * one place, so a project can't claim Dubai, Lebanon. `docs/BRIEF.md` §5 calls
 * country the more useful top-level cut, so it is what `/work` filters on;
 * city and district are display detail.
 */
export const CITY_COUNTRY = {
  'Abu Dhabi': 'UAE',
  Dubai: 'UAE',
  Doha: 'Qatar',
  Beirut: 'Lebanon',
  Baabda: 'Lebanon',
  Byblos: 'Lebanon',
  Faqra: 'Lebanon',
} as const satisfies Record<string, Country>;

export type City = keyof typeof CITY_COUNTRY;

/** Cast because zod needs a non-empty tuple, and Object.keys widens to string. */
export const CITIES = Object.keys(CITY_COUNTRY) as [City, ...City[]];

/* ------------------------------------------------------------------- studio */

export const STUDIOS = ['Step Into Detail', 'Design in Frame'] as const;

export type Studio = (typeof STUDIOS)[number];

/**
 * Shown alongside the studio name on a project page.
 *
 * Derived from the experience timeline in `./cv` rather than written out, so
 * the years a project page prints and the dates `/about` prints are the same
 * fact. Correcting a date is one edit, in the CV.
 */
export const STUDIO_PERIODS: Record<Studio, string> = {
  'Step Into Detail': yearsAt('Step Into Detail'),
  'Design in Frame': yearsAt('Design in Frame'),
};
