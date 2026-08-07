import { defineType, defineField } from 'sanity';

/**
 * The "plate" — the site's signature card: a hard 2px border, a labelled
 * header strip, and a footer that slides its arrow on hover.
 *
 * One shape serves four jobs across the site: the engine cards on the home
 * page, the pricing tiers on Sales Engine, the departments on Content, and the
 * campaign packages on Viral. Fields you leave empty simply do not render, so
 * a pricing plate and a department plate use the same object.
 */
export default defineType({
  name: 'plate',
  title: 'Plate',
  type: 'object',
  fields: [
    defineField({
      name: 'kicker',
      type: 'string',
      title: 'Header — Left',
      description: 'The small label in the top-left of the plate. Shown in red.',
      placeholder: 'e.g., ENGINE NO. 01',
    }),
    defineField({
      name: 'kickerRight',
      type: 'string',
      title: 'Header — Right',
      description: 'The small label in the top-right.',
      placeholder: 'e.g., DXI',
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      placeholder: 'e.g., Sales Engine',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      type: 'string',
      title: 'Role Line',
      description: 'Optional red subtitle under the title.',
      placeholder: 'e.g., THE REVENUE DRIVER',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      title: 'Description',
      placeholder:
        'e.g., A complete sales funnel: direct-response ads, an AI chatbot that closes, and e-commerce built for how Nigerians buy.',
    }),
    defineField({
      name: 'price',
      type: 'object',
      title: 'Price',
      description: 'Leave empty on plates that are not selling a tier or package.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'amount',
          type: 'string',
          title: 'Headline Price',
          placeholder: 'e.g., ₦1.5M  or  FROM ₦1M',
        }),
        defineField({
          name: 'unit',
          type: 'string',
          title: 'What That Buys',
          placeholder: 'e.g., BUILD',
        }),
        defineField({
          name: 'recurringAmount',
          type: 'string',
          title: 'Then — Recurring Price',
          description: 'For tiers with a monthly fee after the build.',
          placeholder: 'e.g., ₦600K/MO',
        }),
      ],
    }),
    defineField({
      name: 'specs',
      type: 'array',
      title: 'Spec Lines',
      description:
        'The list at the bottom of the plate. Wrap the part you want in red with *asterisks* — e.g. "DOES *ADS + CHATBOT + STORE*".',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'footLabel',
      type: 'string',
      title: 'Footer Text',
      description: 'The bar across the bottom of the plate.',
      placeholder: 'e.g., START HERE',
    }),
    defineField({
      name: 'tone',
      type: 'string',
      title: 'Look',
      description: 'Use "Featured" for the one plate you want people to pick.',
      options: {
        list: [
          { title: 'Default (white)', value: 'default' },
          { title: 'Dark (black fill)', value: 'dark' },
          { title: 'Featured (red header + shadow)', value: 'lead' },
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
    defineField({
      name: 'link',
      type: 'cta',
      title: 'Makes The Whole Plate Clickable',
      description:
        'Optional. When set, the entire plate becomes a link. The button style is ignored here.',
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    select: { title: 'title', role: 'role', kicker: 'kicker', tone: 'tone' },
    prepare({ title, role, kicker, tone }) {
      return {
        title: title || 'Untitled plate',
        subtitle: [kicker, role, tone !== 'default' ? tone : null].filter(Boolean).join(' • '),
      };
    },
  },
});
