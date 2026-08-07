import { defineType, defineField } from 'sanity';

/**
 * One-of-a-kind settings shared by every page: the navigation, the footer, and
 * the contact details.
 *
 * The WhatsApp number lives here and nowhere else — buttons across the site
 * only carry their message text, so changing the number here changes it
 * everywhere at once.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'whatsappNumber',
      type: 'string',
      title: 'WhatsApp Number',
      description:
        'International format, digits only, no + or spaces. Every WhatsApp button on the site uses this.',
      placeholder: 'e.g., 2348074533441',
      validation: (Rule) =>
        Rule.required().regex(/^\d{10,15}$/, {
          name: 'digits only',
        }).error('Digits only — no +, spaces or dashes. e.g. 2348074533441'),
    }),
    defineField({
      name: 'phoneDisplay',
      type: 'string',
      title: 'Phone Number — As Shown',
      description: 'How the number is written on the page.',
      placeholder: 'e.g., 0807 453 3441',
    }),
    defineField({
      name: 'phoneDial',
      type: 'string',
      title: 'Phone Number — For Dialling',
      description: 'What actually gets dialled when someone taps it.',
      placeholder: 'e.g., +2348074533441',
    }),
    defineField({
      name: 'navLinks',
      type: 'array',
      title: 'Navigation',
      description: 'The links across the top of every page, in order.',
      of: [
        {
          type: 'object',
          name: 'navLink',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              title: 'Label',
              description: 'Keep it short — the bar gets crowded past seven links.',
              placeholder: 'e.g., Sales Engine',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'page',
              type: 'reference',
              title: 'Page',
              to: [{ type: 'page' }],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'page.slug.current' },
          },
        },
      ],
    }),
    defineField({
      name: 'navCta',
      type: 'cta',
      title: 'Navigation Button',
      description: 'The red button at the end of the navigation.',
    }),
    defineField({
      name: 'footerTagline',
      type: 'string',
      title: 'Footer Tagline',
      placeholder: 'e.g., DIGITAL eXPERIENCES AND INTEGRATED MARKETING · LAGOS',
    }),
    defineField({
      name: 'footerContact',
      type: 'string',
      title: 'Footer Contact Line',
      placeholder: 'e.g., DXIMARKETING.COM · 0807 453 3441',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings', subtitle: 'Navigation, footer and contact details' };
    },
  },
});
