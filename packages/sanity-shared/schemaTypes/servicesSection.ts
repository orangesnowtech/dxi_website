import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'servicesSection',
  title: 'Services Section',
  type: 'document',
  fields: [
    defineField({ name: 'label', type: 'string', initialValue: 'Services We Render' }),
    defineField({ name: 'heading', type: 'string', initialValue: 'Our Expertise' }),
    defineField({
      name: 'services',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', type: 'string', validation: Rule => Rule.required() },
          { name: 'description', type: 'text', validation: Rule => Rule.required() },
          {
            name: 'backgroundColor',
            type: 'string',
            options: { list: ['white', 'black'] },
            initialValue: 'white',
            validation: Rule => Rule.required(),
          },
          { name: 'iconSvg', type: 'text' },
          { name: 'order', type: 'number', validation: Rule => Rule.required() },
        ],
      }],
    }),
  ],
});
