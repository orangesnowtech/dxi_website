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
            name: 'iconName', 
            type: 'string',
            title: 'Icon (Optional)',
            description: 'Select an icon for this service. Leave empty to show no icon.',
            options: {
              list: [
                { title: 'Trending Up', value: 'TrendingUp' },
                { title: 'Palette', value: 'Palette' },
                { title: 'Code', value: 'Code' },
                { title: 'Megaphone', value: 'Megaphone' },
                { title: 'Layers', value: 'Layers' },
                { title: 'Sparkles', value: 'Sparkles' },
                { title: 'Target', value: 'Target' },
                { title: 'Zap', value: 'Zap' },
                { title: 'Globe', value: 'Globe' },
                { title: 'Rocket', value: 'Rocket' },
                { title: 'Pen Tool', value: 'PenTool' },
                { title: 'Camera', value: 'Camera' },
                { title: 'Shopping Cart', value: 'ShoppingCart' },
                { title: 'Search', value: 'Search' },
                { title: 'Bar Chart', value: 'BarChart3' },
                { title: 'Users', value: 'Users' },
                { title: 'Monitor', value: 'Monitor' },
                { title: 'Smartphone', value: 'Smartphone' },
                { title: 'Mail', value: 'Mail' },
                { title: 'Video', value: 'Video' },
                { title: 'Image', value: 'ImageIcon' },
                { title: 'File Text', value: 'FileText' },
                { title: 'Settings', value: 'Settings' },
                { title: 'Lightbulb', value: 'Lightbulb' },
                { title: 'Award', value: 'Award' },
                { title: 'Star', value: 'Star' },
                { title: 'Heart', value: 'Heart' },
                { title: 'Thumbs Up', value: 'ThumbsUp' },
                { title: 'Message Square', value: 'MessageSquare' },
                { title: 'Share', value: 'Share2' },
              ],
            },
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
