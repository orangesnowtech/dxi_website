import {type SchemaTypeDefinition} from 'sanity'

import client from './client'
import concept from './concept'
import conceptPageSettings from './conceptPageSettings'
import contactSubmission from './contactSubmission'
import footerSettings from './footerSettings'
import homepageSettings from './homepageSettings'
import insight from './insight'
import insightCategory from './insightCategory'
import project from './project'
import servicesSection from './servicesSection'
import tag from './tag'
import testimonialsSection from './testimonialsSection'
import whoWeAreSection from './whoWeAreSection'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    client,
    project,
    concept,
    tag,
    insight,
    insightCategory,
    servicesSection,
    testimonialsSection,
    footerSettings,
    whoWeAreSection,
    conceptPageSettings,
    homepageSettings,
    contactSubmission,
  ],
}
