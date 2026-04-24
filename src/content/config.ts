import { defineCollection, z } from 'astro:content';

const papers = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    qameAuthors: z.array(z.string()).optional(),
    date: z.coerce.date(),
    abstract: z.string(),
    keywords: z.array(z.string()).optional(),
    pdf: z.string().optional(),
    doi: z.string().optional(),
    arxiv: z.string().optional(),
    ssrn: z.string().optional(),
    replication: z.string().optional(),
  }),
});

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    qameAuthors: z.array(z.string()).optional(),
    venue: z.string(),
    year: z.number(),
    date: z.coerce.date().optional(),
    fromQamePaper: z.string().optional(),
    doi: z.string().optional(),
    preprint: z.string().optional(),
    replication: z.string().optional(),
    era: z.enum(['since-founding', 'earlier']).default('since-founding'),
  }),
});

const team = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    affiliation: z.string(),
    status: z.enum(['current', 'alumni']).default('current'),
    website: z.string().optional(),
    email: z.string().optional(),
    initials: z.string().optional(),
    order: z.number().default(10),
    alumniRole: z.string().optional(),
    currentPosition: z.string().optional(),
    yearLeft: z.number().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    funder: z.string(),
    yearStart: z.number(),
    yearEnd: z.number().optional(),
    pi: z.string(),
    description: z.string(),
    partner: z.string().optional(),
    order: z.number().default(10),
  }),
});

const grants = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    funder: z.string(),
    pi: z.string(),
    yearStart: z.number(),
    yearEnd: z.number(),
  }),
});

const software = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    fullName: z.string().optional(),
    stack: z.string(),
    description: z.string(),
    repo: z.string(),
    logoColor: z.string().default('#c4622a'),
    logoText: z.string().optional(),
    logoGradient: z.string().optional(),
    order: z.number().default(10),
  }),
});

const data = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    format: z.string(),
    description: z.string(),
    doi: z.string().optional(),
    url: z.string().optional(),
    logoColor: z.string().default('#444'),
    logoText: z.string().optional(),
    order: z.number().default(10),
  }),
});

const news = defineCollection({
  type: 'data',
  schema: z.object({
    platform: z.enum(['bluesky', 'mastodon']),
    text: z.string(),
    url: z.string(),
    postedAt: z.coerce.date(),
  }),
});

export const collections = { papers, publications, team, projects, grants, software, data, news };
