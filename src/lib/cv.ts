/**
 * Lea's CV — `docs/BRIEF.md` §1, and the only place it is written down.
 *
 * `/about` renders all of it. `facets.ts` derives the year span it prints
 * beside a studio name from `yearsAt()` below, so a project page's "Studio"
 * row and the experience timeline on `/about` are one fact rather than two
 * that can drift.
 *
 * Free of imports, like `facets.ts` — which imports this module, and is itself
 * reached from `content.config.ts`, so nothing here may drag `astro:content`
 * in behind it.
 *
 * Nothing here is editorial. Every line traces to the CV as recorded in the
 * brief; where the brief states no fact, there is no field.
 */

/* ----------------------------------------------------------------- helpers */

/** 'Apr 2022' → '2022'. 'present' → 'sent', which `yearsAt` discards. */
const yearOf = (when: string): string => when.slice(-4);

/** 'Apr 2022' → 'Apr'. */
const monthOf = (when: string): string => when.slice(0, -5);

/* -------------------------------------------------------------- experience */

export interface Role {
  /** As the CV states it — not the site's standing title for her. */
  title: string;
  organisation: string;
  where: string;
  /** 'MMM YYYY'. */
  from: string;
  /** 'MMM YYYY', or 'present'. */
  to: string;
}

/** Most recent first, which is the order `/about` prints them in. */
export const EXPERIENCE: Role[] = [
  {
    title: 'Senior Interior Architect',
    organisation: 'Yafawi Design',
    where: 'Europe',
    from: 'Sep 2025',
    to: 'present',
  },
  {
    title: 'Senior Interior Architect',
    organisation: 'Step Into Detail',
    where: 'Dubai, UAE / Beirut',
    from: 'Apr 2022',
    to: 'Aug 2025',
  },
  {
    title: 'Interior Architect',
    organisation: 'Design in Frame',
    where: 'Beirut',
    from: 'Oct 2020',
    to: 'Jan 2022',
  },
  {
    title: 'Interior Architect, intern',
    organisation: 'Design in Frame',
    where: 'Beirut',
    from: 'Aug 2020',
    to: 'Sep 2020',
  },
  {
    title: 'English–French Teacher',
    organisation: 'Little Ones Preschool',
    where: 'Beirut',
    from: 'Nov 2018',
    to: 'Jul 2020',
  },
];

/**
 * A role's dates as the CV prints them — "Apr 2022 – Aug 2025", and
 * "Aug – Sep 2020" where both ends fall in the same year.
 */
export function periodOf(role: Role): string {
  if (role.to === 'present') return `${role.from} – present`;

  return yearOf(role.from) === yearOf(role.to)
    ? `${monthOf(role.from)} – ${role.to}`
    : `${role.from} – ${role.to}`;
}

/**
 * The years she was at an organisation, spanning every stint there — so
 * Design in Frame is "2020–2022" across both the internship and the role that
 * followed it, rather than whichever entry happened to be found first.
 *
 * `facets.ts` prints this beside a studio name on every project page, which is
 * why it is derived from the timeline rather than written out a second time.
 */
export function yearsAt(organisation: string): string {
  const years = EXPERIENCE.filter((role) => role.organisation === organisation)
    .flatMap((role) => [role.from, role.to])
    .map((when) => Number(yearOf(when)))
    // Drops 'present', which has no year to read.
    .filter((year) => Number.isFinite(year));

  if (years.length === 0) {
    throw new Error(`cv: no experience recorded at "${organisation}"`);
  }

  const first = Math.min(...years);
  const last = Math.max(...years);

  return first === last ? `${first}` : `${first}–${last}`;
}

/* ---------------------------------------------------------------- practice */

/**
 * A project end to end, in order, as the CV lists it. `/about` sets them as a
 * numbered sequence — the numbering is presentation; the words are the CV's.
 */
export const STAGES: string[] = [
  'Concept design',
  'Technical documentation',
  'FF&E specification',
  'Procurement',
  'Budget control',
  'Site delivery',
];

/* ------------------------------------------------------------------ skills */

export const SKILLS: string[] = [
  'Space planning',
  'Project management',
  'Cost and budget analysis',
  'Colour theory',
  'Material and furniture selection',
  'Contractor and supplier coordination',
  'Client presentation',
];

export const SOFTWARE: string[] = [
  'AutoCAD',
  'Adobe Photoshop',
  'Adobe Illustrator',
  'Microsoft Office',
];

export const LANGUAGES: { name: string; level: string }[] = [
  { name: 'English', level: 'Fluent' },
  { name: 'French', level: 'Fluent' },
  { name: 'Arabic', level: 'Native' },
];

/* --------------------------------------------------------------- education */

export interface Qualification {
  award: string;
  institution: string;
  /** Absent where the brief states none. */
  where?: string;
  years: string;
}

export const EDUCATION: Qualification[] = [
  {
    award: 'BA Interior Design, with Honors',
    institution: 'American University of Science and Technology',
    where: 'Beirut',
    years: '2014–2018',
  },
  {
    award: 'Lebanese Baccalaureate, Literature & Humanity',
    institution: 'École Sainte-Anne des sœurs de Besançon',
    years: '2014',
  },
];
