import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from '../packages/sanity-shared/env'
import {schema} from '../packages/sanity-shared/schemaTypes'
import {structure} from '../packages/sanity-shared/structure'

export default defineConfig({
  basePath: '/',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
})

