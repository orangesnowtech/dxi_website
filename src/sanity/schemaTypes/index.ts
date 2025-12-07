import { type SchemaTypeDefinition } from 'sanity'
import client from './client'
import project from './project'
import concept from './concept'
import tag from './tag'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [client, project, concept, tag],
}
