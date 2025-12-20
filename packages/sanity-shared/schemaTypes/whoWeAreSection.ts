import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'whoWeAreSection',
  title: 'Who We Are Section',
  type: 'document',
  fields: [
    defineField({ name: 'label', type: 'string', initialValue: 'Who We Are' }),
    defineField({
      name: 'heading',
      type: 'text',
      validation: Rule => Rule.required(),
      description: 'Use {highlight}Text{/highlight} to highlight words.',
    }),
    defineField({ name: 'buttonText', type: 'string', initialValue: 'Work with Us' }),
    defineField({ name: 'buttonLink', type: 'string', initialValue: '/contact-us' }),
  ],
});
