import { type SchemaTypeDefinition } from 'sanity'
import client from './client'
import project from './project'
import concept from './concept'
import tag from './tag'
import insight from './insight'
import insightCategory from './insightCategory'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [client, project, concept, tag, insight, insightCategory],
}
