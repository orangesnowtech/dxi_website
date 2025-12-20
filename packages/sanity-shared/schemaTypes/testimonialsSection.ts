import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'document',
  fields: [
    defineField({ name: 'label', type: 'string', initialValue: 'Testimonials' }),
    defineField({ name: 'backgroundImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'testimonials',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'quote', type: 'text', validation: Rule => Rule.required() },
          { name: 'campaign', type: 'string', validation: Rule => Rule.required() },
          { name: 'order', type: 'number', validation: Rule => Rule.required() },
        ],
      }],
    }),
  ],
});
