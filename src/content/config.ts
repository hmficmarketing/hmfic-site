import { defineCollection, z } from 'astro:content';

const chapterSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    eyebrow: z.string(),
    headline: z.string(),
    headlineAccent: z.string().optional(),
    dek: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
    skipAnchor: z.string().default('#chapter-2'),
  }),
  z.object({
    type: z.literal('text'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    callout: z.object({ label: z.string(), body: z.string() }).optional(),
  }),
  z.object({
    type: z.literal('build'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    beforeAfter: z.object({
      before: z.string(),
      after: z.string(),
      beforeAlt: z.string(),
      afterAlt: z.string(),
    }).optional(),
    screenshots: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    })).default([]),
  }),
  z.object({
    type: z.literal('intelligence'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    snippets: z.array(z.object({
      tag: z.string(),
      excerptLabel: z.string(),
      heading: z.string(),
      rows: z.array(z.object({ key: z.string(), value: z.string() })),
      footerLeft: z.string(),
      footerRight: z.string(),
    })).length(3),
    pullQuote: z.object({ body: z.string(), attribution: z.string() }),
  }),
  z.object({
    type: z.literal('engine'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    samples: z.array(z.object({
      label: z.string(),
      title: z.string(),
      body: z.string(),
      footnote: z.string().optional(),
    })),
  }),
  z.object({
    type: z.literal('offer'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    body: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
]);

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    status: z.enum(['live', 'in-progress', 'draft']),
    eyebrow: z.string(),
    ogImage: z.string(),
    publishDate: z.date(),
    chapters: z.array(chapterSchema),
  }),
});

export const collections = { caseStudies };
