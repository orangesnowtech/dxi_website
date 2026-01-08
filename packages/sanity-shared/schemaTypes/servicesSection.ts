import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'servicesSection',
  title: 'Services Section',
  type: 'document',
  fields: [
    defineField({
      name: 'services',
      type: 'array',
      title: 'Services Section',
      description: 'Add up to 6 services. Label "What we do" and heading "Our Expertise" are hardcoded.',
      of: [{
        type: 'object',
        fields: [
          { 
            name: 'title', 
            type: 'string', 
            title: 'Service Title',
            description: 'Example: "Brand Identity Design", "Digital Marketing", "Web Development"',
            placeholder: 'e.g., Brand Identity Design',
          },
          { 
            name: 'description', 
            type: 'text', 
            title: 'Service Description',
            description: 'Brief description of the service',
            placeholder: 'e.g., We create memorable brand identities that resonate with your target audience and set you apart from competitors.',
          },
          {
            name: 'backgroundColor',
            type: 'string',
            title: 'Background Color',
            description: 'Choose white or black background for the service card',
            options: { 
              list: [
                { title: 'White', value: 'white' },
                { title: 'Black', value: 'black' }
              ] 
            },
            initialValue: 'white',
          },
          { 
            name: 'iconSvg', 
            type: 'text',
            title: 'Icon SVG (Optional)',
            description: 'Paste SVG code for custom icon. Leave empty to use default icon.',
            placeholder: '<svg>...</svg>'
          },
          { 
            name: 'order', 
            type: 'number',
            title: 'Display Order',
            description: 'Order in which this service appears (1-6). Lower numbers appear first.',
            placeholder: 'e.g., 1',
          },
        ],
        preview: {
          select: {
            title: 'title',
            order: 'order',
            bgColor: 'backgroundColor',
          },
          prepare({ title, order, bgColor }) {
            return {
              title: title || 'Untitled Service',
              subtitle: `Order: ${order || 'N/A'} • ${bgColor || 'white'} background`,
            };
          },
        },
      }],
    }),
  ],
});
