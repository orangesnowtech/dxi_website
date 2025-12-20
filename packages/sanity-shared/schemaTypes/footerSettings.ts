import { defineField, defineType } from "sanity";

export default defineType({
  name: "footerSettings",
  type: "document",
  title: "Footer Settings",
  fields: [
    defineField({
      name: "address",
      type: "string",
      title: "Physical Address",
    }),
    defineField({
      name: "phones",
      type: "array",
      of: [{ type: "string" }],
      title: "Phone Numbers",
    }),
    defineField({
      name: "email",
      type: "string",
      title: "Email Address",
    }),
    defineField({
      name: "socialLinks",
      type: "object",
      title: "Social Links",
      fields: [
        { name: "x", type: "url", title: "X / Twitter" },
        { name: "facebook", type: "url", title: "Facebook" },
        { name: "linkedin", type: "url", title: "LinkedIn" },
        { name: "instagram", type: "url", title: "Instagram" },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Footer Settings" };
    },
  },
});
