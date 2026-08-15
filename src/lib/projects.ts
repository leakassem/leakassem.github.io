import { getCollection, type CollectionEntry } from 'astro:content';

import {
  CITY_COUNTRY,
  COUNTRIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  STATUS_LABELS,
  STUDIOS,
  TYPE_LABELS,
  type Country,
  type ProjectStatus,
  type ProjectType,
  type Studio,
} from './facets';

/*
  Everything pages ask of the project data. Templates should read from here
  rather than reaching into `entry.data.sections` themselves, so that how a
  project's area or role list is assembled stays one decision in one place.
*/

export type Project = CollectionEntry<'projects'>;

/* ------------------------------------------------------------------ loading */

/** Source PDF pages this project spans, ascending. */
export function sheetsOf(project: Project): number[] {
  return project.data.sections.map((section) => section.sheet).sort((a, b) => a - b);
}

/**
 * All projects in portfolio order.
 *
 * Order is the source portfolio's sheet order, which is Lea's own sequence and
 * groups the studios — no hand-maintained `order` field to fall out of step
 * with the content. If she ever wants a different order, that becomes an
 * optional `order` field consulted here first.
 */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => sheetsOf(a)[0]! - sheetsOf(b)[0]!);
}

/** The home page's selected work, in portfolio order. */
export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((project) => project.data.featured);
}

/**
 * Where a project card links.
 *
 * Detail pages are step 7. Until they exist every card lands on the work index
 * rather than a 404 — a nav link that 404s is worse than a thin page, and the
 * site is live. This is the one line that changes when step 7 lands, which is
 * why no page writes the href itself.
 */
export function hrefOf(_project: Project): string {
  // Step 7: return `/work/${_project.id}`;
  return '/work';
}

/* --------------------------------------------------------------- derivation */

/** Derived from city, never stored — see CITY_COUNTRY. */
export function countryOf(project: Project): Country {
  return CITY_COUNTRY[project.data.city];
}

/**
 * Full place line: "Ashrafieh, Beirut, Lebanon".
 *
 * `development` is deliberately left out — "3Beirut, Downtown, Beirut" reads
 * as a stutter. It is a metadata row of its own on the detail page.
 */
export function locationOf(project: Project): string {
  const { district, city } = project.data;
  return [district, city, countryOf(project)].filter(Boolean).join(', ');
}

/** Compact place line for a card: "Beirut, Lebanon". */
export function placeOf(project: Project): string {
  return `${project.data.city}, ${countryOf(project)}`;
}

/**
 * Square metres she designed.
 *
 * Whole-project figure when a sheet states one, otherwise the sum of the
 * sections — AD villa's 70 m² reception plus 50 m² of media room and office is
 * 120 m² of scope. Undefined when no area was ever stated.
 */
export function areaOf(project: Project): number | undefined {
  if (project.data.area !== undefined) return project.data.area;

  const areas = project.data.sections
    .map((section) => section.area)
    .filter((area): area is number => area !== undefined);

  return areas.length > 0 ? areas.reduce((total, area) => total + area, 0) : undefined;
}

/** Area ready to print, or undefined. */
export function areaLabel(project: Project): string | undefined {
  const area = areaOf(project);
  // Non-breaking space — "240 m²" must never wrap between number and unit.
  return area === undefined ? undefined : `${area} m²`;
}

/**
 * Square metres across a set of projects — the sum of what the sheets state.
 *
 * Projects whose sheets state no area contribute nothing rather than a guess,
 * so this is a floor and not an estimate.
 */
export function totalAreaOf(projects: Project[]): number {
  return projects.reduce((total, project) => total + (areaOf(project) ?? 0), 0);
}

/** Rooms covered, one entry per sheet that names them. */
export function roomsOf(project: Project): string[] {
  return project.data.sections
    .map((section) => section.rooms)
    .filter((rooms): rooms is string => Boolean(rooms));
}

/**
 * Every distinct role bullet across the project's sheets, in the order they
 * first appear. Multi-sheet projects repeat most of their bullets; the detail
 * page wants the union, not the repetition.
 */
export function rolesOf(project: Project): string[] {
  return [...new Set(project.data.sections.flatMap((section) => section.role))];
}

export function statusLabel(status: ProjectStatus): string {
  return STATUS_LABELS[status];
}

export function typeLabel(type: ProjectType, count = 1): string {
  return count === 1 ? TYPE_LABELS[type].one : TYPE_LABELS[type].many;
}

/* ------------------------------------------------------------------- facets */

/** One filter option, with the number of projects behind it. */
export interface Facet {
  value: string;
  label: string;
  count: number;
}

/**
 * The four cuts `/work` filters on (`docs/BRIEF.md` §5). Location is by
 * country — the brief's recommended top-level cut, and the only one whose
 * options stay countable at 17 projects.
 */
export interface FacetGroups {
  type: Facet[];
  location: Facet[];
  status: Facet[];
  studio: Facet[];
}

/**
 * Counts each facet value across the given projects.
 *
 * Driven by the vocabularies in `facets.ts`, so options keep a deliberate
 * order rather than whichever project happened to load first. Values nothing
 * matches are dropped — an always-empty filter is noise.
 */
export function facetsOf(projects: Project[]): FacetGroups {
  const tally = <T extends string>(
    values: readonly T[],
    valueOf: (project: Project) => T,
    labelOf: (value: T, count: number) => string,
  ): Facet[] =>
    values
      .map((value) => {
        const count = projects.filter((project) => valueOf(project) === value).length;
        return { value, label: labelOf(value, count), count };
      })
      .filter((facet) => facet.count > 0);

  return {
    type: tally(PROJECT_TYPES, (project) => project.data.type, typeLabel),
    location: tally(COUNTRIES, countryOf, (country) => country),
    status: tally(PROJECT_STATUSES, (project) => project.data.status, statusLabel),
    studio: tally(STUDIOS, (project) => project.data.studio as Studio, (studio) => studio),
  };
}
