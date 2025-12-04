import { type SchemaTypeDefinition } from 'sanity'
import project from './project'
import product from './product'
import concept from './concept'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, product, concept],
}
