import { defineField, defineType } from "sanity";

export default defineType({
  name: "footerSettings",
  type: "document",
  title: "Contact Information",
  fields: [
    defineField({
      name: "address",
      type: "string",
      title: "Physical Address",
      description: "Your business physical address",
      placeholder: "e.g., 123 Business Street, City, State 12345",
    }),
    defineField({
      name: "phones",
      type: "array",
      of: [{ type: "string" }],
      title: "Phone Numbers",
      description: "Add one or more phone numbers",
      initialValue: ["+1 (555) 123-4567"],
    }),
    defineField({
      name: "email",
      type: "string",
      title: "Email Address",
      description: "Contact email address",
      placeholder: "e.g., contact@yourcompany.com",
    }),
    defineField({
      name: "socialLinks",
      type: "object",
      title: "Social Links",
      description: "Links to your social media profiles",
      fields: [
        { 
          name: "x", 
          type: "url", 
          title: "X / Twitter",
          description: "Your X (Twitter) profile URL",
          placeholder: "https://twitter.com/yourcompany"
        },
        { 
          name: "facebook", 
          type: "url", 
          title: "Facebook",
          description: "Your Facebook page URL",
          placeholder: "https://facebook.com/yourcompany"
        },
        { 
          name: "linkedin", 
          type: "url", 
          title: "LinkedIn",
          description: "Your LinkedIn company page URL",
          placeholder: "https://linkedin.com/company/yourcompany"
        },
        { 
          name: "instagram", 
          type: "url", 
          title: "Instagram",
          description: "Your Instagram profile URL",
          placeholder: "https://instagram.com/yourcompany"
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Contact Information" };
    },
  },
});
