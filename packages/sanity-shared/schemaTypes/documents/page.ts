import { defineType, defineField } from 'sanity';

/**
 * Every public page on the site. Pages are built by stacking sections, so a
 * new engine page needs no code — add a page, stack sections, publish.
 */
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Page Name',
      description: 'For your reference in the studio. Not shown on the site.',
      placeholder: 'e.g., Sales Engine',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Web Address',
      description:
        'The part of the URL after dximarketing.com/. Use "home" for the front page — it is served at the root.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'breadcrumb',
      type: 'string',
      title: 'Breadcrumb Label',
      description:
        'The small red text in the trail at the top of the page. Leave empty to hide the trail — the home page has none.',
      placeholder: 'e.g., ENGINE NO. 01',
    }),
    defineField({
      name: 'sections',
      type: 'array',
      title: 'Sections',
      description: 'Stack the page top to bottom. Drag to reorder.',
      of: [
        { type: 'heroSection' },
        { type: 'introSection' },
        { type: 'cardGrid' },
        { type: 'plateGrid' },
        { type: 'statsSection' },
        { type: 'stepsSection' },
        { type: 'faqSection' },
        { type: 'courseGrid' },
        { type: 'webinarGrid' },
        { type: 'richSection' },
        { type: 'ctaSection' },
      ],
    }),
    defineField({
      name: 'seo',
      type: 'object',
      title: 'Search & Sharing',
      description: 'How this page appears in Google and when shared on social media.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'title',
          type: 'string',
          title: 'Search Title',
          description: 'Around 60 characters. Falls back to the page name.',
          placeholder: "e.g., DXI Sales Engine — A Sales Funnel as a Product",
        }),
        defineField({
          name: 'description',
          type: 'text',
          rows: 3,
          title: 'Search Description',
          description: 'Around 155 characters.',
          validation: (Rule) => Rule.max(200).warning('Google truncates past roughly 155 characters.'),
        }),
        defineField({
          name: 'image',
          type: 'image',
          title: 'Sharing Image',
          description: 'Shown when the page is shared. 1200×630 works best.',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', sections: 'sections' },
    prepare({ title, slug, sections }) {
      const count = Array.isArray(sections) ? sections.length : 0;
      return {
        title: title || 'Untitled page',
        subtitle: `/${slug === 'home' ? '' : (slug ?? '')} • ${count} section${count === 1 ? '' : 's'}`,
      };
    },
  },
});
