import type {StructureResolver} from 'sanity/structure'

/**
 * Site Settings is a singleton — there is only ever one of it, so it opens
 * straight into the editor instead of showing a list with one row.
 *
 * https://www.sanity.io/docs/structure-builder-cheat-sheet
 */
const SINGLETONS = ['siteSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !SINGLETONS.includes(item.getId() ?? '')),
    ])
