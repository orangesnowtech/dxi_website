import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'conceptPageSettings',
  title: 'Concept Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'aboutParagraph',
      title: 'About DXI Paragraph',
      type: 'text',
      description: 'Paragraph shown in the About DXI section on the concepts page',
      placeholder:
        'e.g., DXI Marketing crafts impactful digital experiences that blend creativity and strategy to help brands grow.',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Concept Page Settings',
        subtitle: 'About DXI paragraph',
      }
    },
  },
})

