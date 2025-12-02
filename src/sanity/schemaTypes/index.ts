import { type SchemaTypeDefinition } from 'sanity'
import project from './project'
import product from './product'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, product],
}
