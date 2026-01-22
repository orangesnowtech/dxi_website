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
      title: 'Testimonials',
      description: 'Add testimonials from campaigns',
      of: [{
        type: 'object',
        fields: [
          { 
            name: 'quote', 
            type: 'text', 
            title: 'Testimonial Quote',
            description: 'The testimonial text',
            placeholder: 'e.g., "This campaign exceeded all our expectations and delivered outstanding results."',
          },
          { 
            name: 'designation', 
            type: 'string',
            title: 'Designation',
            description: 'Job title or role of the person',
            placeholder: 'e.g., CEO, Marketing Director, Product Manager',
          },
          { 
            name: 'name', 
            type: 'string',
            title: 'Name',
            description: 'Full name of the person giving the testimonial',
            placeholder: 'e.g., John Doe, Jane Smith',
          },
          { 
            name: 'company', 
            type: 'string',
            title: 'Company Name',
            description: 'Company or organization name',
            placeholder: 'e.g., Tech Corp, Marketing Agency Inc.',
          },
          { 
            name: 'order', 
            type: 'number',
            title: 'Display Order',
            description: 'Order in which this testimonial appears (lower numbers first)',
            placeholder: 'e.g., 1',
          },
        ],
        preview: {
          select: {
            name: 'name',
            company: 'company',
            quote: 'quote',
            order: 'order',
          },
          prepare({ name, company, quote, order }) {
            return {
              title: name || 'Untitled Testimonial',
              subtitle: `${company ? `${company} • ` : ''}${quote?.substring(0, 40)}... • Order: ${order || 'N/A'}`,
            };
          },
        },
      }],
    }),
  ],
});
