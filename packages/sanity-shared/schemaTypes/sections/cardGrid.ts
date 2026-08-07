import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * The workhorse section: a heading followed by two or three simple cards.
 * Covers "Three gifts, one community", "Why the Force matters", the Sales
 * Engine problem cards, and the Academy join steps.
 */
export default defineType({
  name: 'cardGrid',
  title: 'Card Grid',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'columns',
      type: 'number',
      title: 'Cards Per Row',
      options: {
        list: [
          { title: 'Two', value: 2 },
          { title: 'Three', value: 3 },
        ],
        layout: 'radio',
      },
      initialValue: 3,
    }),
    defineField({
      name: 'cards',
      type: 'array',
      title: 'Cards',
      of: [
        {
          type: 'object',
          name: 'card',
          fields: [
            defineField({
              name: 'eyebrow',
              type: 'string',
              title: 'Eyebrow',
              description: 'Optional red tag above the title.',
              placeholder: 'e.g., Joined, not bought',
            }),
            defineField({
              name: 'step',
              type: 'string',
              title: 'Step Number',
              description: 'Optional. Shows as a large red number above the title.',
              placeholder: 'e.g., 01',
            }),
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              type: 'text',
              rows: 4,
              title: 'Body',
            }),
            defineField({
              name: 'tone',
              type: 'string',
              title: 'Look',
              options: {
                list: [
                  { title: 'Light', value: 'light' },
                  { title: 'Dark', value: 'dark' },
                ],
                layout: 'radio',
              },
              initialValue: 'light',
            }),
            defineField({
              name: 'emphasis',
              type: 'boolean',
              title: 'Thicker Border',
              description: 'Draws a heavier outline to make this card stand out.',
              initialValue: false,
            }),
            defineField({
              name: 'showTick',
              type: 'boolean',
              title: 'Red Arrow Before Title',
              initialValue: true,
            }),
            defineField({
              name: 'cta',
              type: 'cta',
              title: 'Button',
              options: { collapsible: true, collapsed: true },
            }),
          ],
          preview: {
            select: { title: 'title', tone: 'tone', step: 'step' },
            prepare({ title, tone, step }) {
              return {
                title: [step, title].filter(Boolean).join(' — ') || 'Untitled card',
                subtitle: tone === 'dark' ? 'Dark' : 'Light',
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'band',
      type: 'band',
      title: 'Closing Strip',
      description: 'Optional black strip below the cards.',
      options: { collapsible: true, collapsed: true },
    }),
    sectionIdField,
    backgroundField,
  ],
  preview: {
    select: { title: 'heading', cards: 'cards', eyebrow: 'eyebrow' },
    prepare({ title, cards, eyebrow }) {
      const count = Array.isArray(cards) ? cards.length : 0;
      return {
        title: title || eyebrow || 'Card grid',
        subtitle: `Card grid • ${count} card${count === 1 ? '' : 's'}`,
      };
    },
  },
});
