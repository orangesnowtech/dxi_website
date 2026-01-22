import { defineField, defineType } from "sanity";

export default defineType({
  name: "homepageSettings",
  type: "document",
  title: "Homepage Landing Section",
  fields: [
    defineField({
      name: "heroImage",
      type: "image",
      title: "Hero Background Image",
      description: "Background image for the landing section",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "heading1",
      type: "string",
      title: "First Heading",
      description: "First heading text (e.g., 'A Digital experience and')",
      initialValue: "A Digital experience and",
      placeholder: "e.g., A Digital experience and",
    }),
    defineField({
      name: "heading2",
      type: "string",
      title: "Second Heading",
      description: "Second heading text (e.g., 'Integrated Marketing Agency')",
      initialValue: "Integrated Marketing Agency",
      placeholder: "e.g., Integrated Marketing Agency",
    }),
    defineField({
      name: "buttonText",
      type: "string",
      title: "Button Text",
      description: "Text displayed on the call-to-action button",
      initialValue: "Send Us a Brief",
      placeholder: "e.g., Send Us a Brief",
    }),
    defineField({
      name: "buttonLink",
      type: "string",
      title: "Button Link",
      description: "URL or path the button links to",
      initialValue: "/contact-us",
      placeholder: "e.g., /contact-us",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Homepage Landing Section",
        subtitle: "Hero image, headings, and CTA button",
      };
    },
  },
});

