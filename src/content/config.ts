import { defineCollection, reference, z } from 'astro:content';

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
    replication: z.string().url().optional(),
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
    fromQamePaper: reference('papers').optional(),
    doi: z.string().optional(),
    preprint: z.string().url().optional(),
    replication: z.string().url().optional(),
    era: z.enum(['since-founding', 'earlier']).default('since-founding'),
  }),
});

const team = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('status', [
    z.object({
      status: z.literal('current').default('current'),
      kind: z.enum(['human', 'agent']).default('human'),
      name: z.string(),
      role: z.string(),
      affiliation: z.string(),
      website: z.string().url().optional(),
      email: z.string().email().optional(),
      initials: z.string().optional(),
      description: z.string().optional(),
      portrait: z.string().optional(),
      order: z.number().default(10),
    }),
    z.object({
      status: z.literal('alumni'),
      name: z.string(),
      role: z.string(),
      affiliation: z.string(),
      alumniRole: z.string().optional(),
      currentPosition: z.string().optional(),
      yearLeft: z.number(),
    }),
  ]),
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
    repo: z.string().url(),
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
    url: z.string().url().optional(),
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
    url: z.string().url(),
    postedAt: z.coerce.date(),
  }),
});

const briefings = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    title: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    byline: z.string().optional(),
  }),
});

export const collections = { papers, publications, team, projects, grants, software, data, news, briefings };
