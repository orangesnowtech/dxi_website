import { defineType, defineField } from 'sanity';

/**
 * A single call-to-action button.
 *
 * Almost every CTA on the site opens WhatsApp with a pre-filled message, so
 * that is the default. The phone number itself lives once in Site Settings —
 * authors only write the message, never the number.
 */
export default defineType({
  name: 'cta',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      title: 'Button Text',
      description: 'The words on the button.',
      placeholder: 'e.g., Grow my business',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'kind',
      type: 'string',
      title: 'Where It Goes',
      description: 'What happens when someone clicks this button.',
      options: {
        list: [
          { title: 'Open WhatsApp chat', value: 'whatsapp' },
          { title: 'Jump to a section on this page', value: 'anchor' },
          { title: 'Go to another DXI page', value: 'page' },
          { title: 'Start a phone call', value: 'tel' },
          { title: 'Go to an external website', value: 'url' },
          { title: 'Not clickable (info only)', value: 'static' },
        ],
        layout: 'radio',
      },
      initialValue: 'whatsapp',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      type: 'text',
      rows: 2,
      title: 'Pre-filled WhatsApp Message',
      description:
        'The message already typed out when WhatsApp opens. Write it as the customer, not as DXI.',
      placeholder: "e.g., Hello DXI, I'd like to talk about growing my business.",
      hidden: ({ parent }) => parent?.kind !== 'whatsapp',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { kind?: string } | undefined;
          if (parent?.kind === 'whatsapp' && !value) {
            return 'Write the message that should be pre-filled in WhatsApp.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'anchor',
      type: 'string',
      title: 'Section ID',
      description:
        'The "Section ID" of the section to scroll to, without the # — set it on that section first.',
      placeholder: 'e.g., tiers',
      hidden: ({ parent }) => parent?.kind !== 'anchor',
    }),
    defineField({
      name: 'page',
      type: 'reference',
      title: 'Page',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.kind !== 'page',
    }),
    defineField({
      name: 'path',
      type: 'string',
      title: 'Path On This Site',
      description:
        'For pages not managed here — e.g. the business profile form. Start with a slash.',
      placeholder: 'e.g., /business-profile',
      hidden: ({ parent }) => parent?.kind !== 'url',
    }),
    defineField({
      name: 'style',
      type: 'string',
      title: 'Look',
      description: 'Red is the primary action. Use outline for the secondary option beside it.',
      options: {
        list: [
          { title: 'Solid red', value: 'signal' },
          { title: 'Solid black', value: 'ink' },
          { title: 'Outline (on light background)', value: 'line' },
          { title: 'Outline (on dark background)', value: 'lineInverse' },
        ],
      },
      initialValue: 'signal',
    }),
  ],
  preview: {
    select: { title: 'label', kind: 'kind', style: 'style' },
    prepare({ title, kind, style }) {
      const destinations: Record<string, string> = {
        whatsapp: 'WhatsApp',
        anchor: 'Scrolls down page',
        page: 'Another page',
        tel: 'Phone call',
        url: 'Link',
        static: 'Not clickable',
      };
      return {
        title: title || 'Untitled button',
        subtitle: `${destinations[kind] || 'Unset'} • ${style || 'signal'}`,
      };
    },
  },
});
