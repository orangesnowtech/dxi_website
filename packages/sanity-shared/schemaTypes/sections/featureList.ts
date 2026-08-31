import { defineType, defineField } from 'sanity';
import { sectionHeaderFields, sectionIdField, backgroundField } from './sectionFields';

/**
 * Tier options, shared by the feature and its bullet points so both read from
 * the same ladder. A capability tagged at a tier is included at that tier and
 * every tier above it — authors tag where it *first* appears, never twice.
 */
const TIER_OPTIONS = {
  list: [
    { title: 'Starter', value: 'starter' },
    { title: 'Standard', value: 'standard' },
    { title: 'Scale', value: 'scale' },
  ],
  layout: 'radio' as const,
};

/**
 * The "what's inside" breakdown: one spec grid where every row opens to its
 * own explanation. Built for the Sales Engine section between the problem
 * cards and the pricing plates.
 *
 * A capability carries the tier it *first* appears at and the site fills in
 * every tier above, so authors never tag the same thing twice. A point prints
 * its badge only where it differs from its feature's, which keeps the grid
 * quiet — so tag every point honestly rather than repeating the parent.
 */
export default defineType({
  name: 'featureList',
  title: 'Feature Breakdown',
  type: 'object',
  fields: [
    ...sectionHeaderFields,
    defineField({
      name: 'caption',
      type: 'string',
      title: 'Legend',
      description: 'Small print above the grid. Say that rows open, and that a tier includes the ones before it.',
      placeholder: 'e.g., Every tier includes everything to its left. Open any row for the detail.',
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Features',
      description: 'Numbers are added automatically in order — do not type them.',
      of: [
        {
          type: 'object',
          name: 'feature',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Feature Name',
              placeholder: 'e.g., Unified Communications',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'lede',
              type: 'string',
              title: 'One-Line Summary',
              description: 'Optional. The bit after the dash — sits under the name in red.',
              placeholder: 'e.g., one inbox for every channel',
            }),
            defineField({
              name: 'tier',
              type: 'string',
              title: 'Unlocks At',
              description: 'The lowest tier that includes this feature.',
              options: TIER_OPTIONS,
              initialValue: 'starter',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              type: 'text',
              rows: 4,
              title: 'Body',
            }),
            defineField({
              name: 'points',
              type: 'array',
              title: 'Bullet Points',
              of: [
                {
                  type: 'object',
                  name: 'featurePoint',
                  fields: [
                    defineField({
                      name: 'text',
                      type: 'string',
                      title: 'Point',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'tier',
                      type: 'string',
                      title: 'Unlocks At',
                      options: TIER_OPTIONS,
                      initialValue: 'starter',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: { title: 'text', subtitle: 'tier' },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title', lede: 'lede', tier: 'tier', points: 'points' },
            prepare({ title, lede, tier, points }) {
              const count = Array.isArray(points) ? points.length : 0;
              return {
                title: [title, lede].filter(Boolean).join(' — ') || 'Untitled feature',
                subtitle: `${String(tier || 'starter').toUpperCase()} • ${count} point${count === 1 ? '' : 's'}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'band',
      type: 'band',
      title: 'Lead-In Strip',
      description: 'Optional black strip above the grid — the place to name the three tiers.',
      options: { collapsible: true, collapsed: true },
    }),
    sectionIdField,
    backgroundField,
  ],
  preview: {
    select: { title: 'heading', features: 'features', eyebrow: 'eyebrow' },
    prepare({ title, features, eyebrow }) {
      const count = Array.isArray(features) ? features.length : 0;
      return {
        title: title || eyebrow || 'Feature breakdown',
        subtitle: `Feature breakdown • ${count} feature${count === 1 ? '' : 's'}`,
      };
    },
  },
});
