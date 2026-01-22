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
      title: 'Heading Text',
      description: 'Use {highlight}Text{/highlight} to highlight words in orange.',
      placeholder: 'e.g., We are a {highlight}creative agency{/highlight} that transforms ideas into reality',
    }),
    defineField({ 
      name: 'buttonText', 
      type: 'string', 
      title: 'Button Text',
      description: 'Text displayed on the call-to-action button',
      initialValue: 'Work with Us',
      placeholder: 'e.g., Work with Us, Get Started, Contact Us'
    }),
    defineField({ 
      name: 'buttonLink', 
      type: 'string',
      title: 'Button Link',
      description: 'URL or path the button links to',
      initialValue: '/contact-us',
      placeholder: 'e.g., /contact-us, /get-started'
    }),
  ],
});
