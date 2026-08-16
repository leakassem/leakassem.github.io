import { getCollection, type CollectionEntry } from 'astro:content';

import {
  CITY_COUNTRY,
  COUNTRIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  STATUS_LABELS,
  STUDIO_PERIODS,
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
 * Where a project card links. No page writes this href itself.
 *
 * Trailing slash because that is the URL Pages serves — see `trailingSlash` in
 * `astro.config.mjs`. The sitemap builds its entries from this same function.
 */
export function hrefOf(project: Project): string {
  return `/work/${project.id}/`;
}

/**
 * The project after this one, wrapping past the last back to the first.
 *
 * Portfolio order, so "next" on the site is next in Lea's own sequence. The
 * wrap is why it returns a project rather than `undefined` — a detail page
 * always has somewhere to go on.
 */
export async function nextProject(project: Project): Promise<Project> {
  const projects = await getProjects();
  const index = projects.findIndex((candidate) => candidate.id === project.id);
  return projects[(index + 1) % projects.length]!;
}

/**
 * The `view-transition-name` a project's hero carries, on the card it is
 * clicked from and on the detail page it lands on.
 *
 * Both ends have to agree exactly or the image cross-fades instead of moving,
 * so the name is derived here rather than written at either call site. Prefixed
 * because a CSS identifier can't start with a digit and `3b-apartment` does.
 */
export function transitionNameOf(project: Project): string {
  return `project-${project.id}`;
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

/**
 * A number of square metres ready to print.
 *
 * The space is non-breaking, written as an escape rather than typed: "240 m²"
 * must never wrap between the number and its unit, and an invisible character
 * sitting in the source is the kind of thing that gets deleted by accident.
 */
function squareMetres(area: number): string {
  return `${area}\u00a0m²`;
}

/** Area ready to print, or undefined. */
export function areaLabel(project: Project): string | undefined {
  const area = areaOf(project);
  return area === undefined ? undefined : squareMetres(area);
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

/** One sheet's worth of the project, ready to print. */
export interface Scope {
  /** Rooms this sheet covers. Absent when it covers the whole property. */
  rooms?: string;
  /** This part's own area, when the sheets state it per part rather than overall. */
  area?: string;
  /** Only when this part's status differs from the project's — Qatar villa's outdoor. */
  status?: string;
  /** What she did on this part, as the sheet lists it. */
  role: string[];
}

/**
 * The project broken into the parts its sheets describe.
 *
 * This is what the detail page renders instead of one flattened role list.
 * AD villa is two sheets covering different rooms, with different areas and
 * different roles — "70 m² reception" and "50 m² media room, guest bedroom and
 * home office" is the fact, and a union of the bullets would lose which
 * belonged to which. A project with one sheet gets one scope, which the page
 * renders without a sub-heading.
 *
 * Replaced step 3's `roomsOf` and `rolesOf`: two helpers assembling the same
 * material separately is exactly the contradiction this module exists to stop.
 */
export function scopesOf(project: Project): Scope[] {
  return project.data.sections.map((section) => ({
    rooms: section.rooms,
    area: section.area === undefined ? undefined : squareMetres(section.area),
    status: section.status === undefined ? undefined : statusLabel(section.status),
    role: [...section.role],
  }));
}

/** The studio she did the work at, with the years she was there. */
export function studioOf(project: Project): { name: Studio; period: string } {
  const name = project.data.studio as Studio;
  return { name, period: STUDIO_PERIODS[name] };
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
