import { getUserFromSession } from '../../index'
import db from '../../../common/prisma'

export default {
  name: 'PamplonaAuthenticated.getPlayerUGCLimits',
  execute: async (_params: {}, session: string) => {
    const personaId = getUserFromSession(session)

    if (!personaId) {
      throw new Error('Invalid session')
    }

    const ugcCount = await db.ugc.count({
      where: { creatorId: personaId },
    })

    const publishedCount = await db.ugc.count({
      where: { creatorId: personaId, published: true },
    })

    return {
      ugcCount,
      maxUgc: 100,
      publishedCount,
      maxPublished: 100, // TODO: change back to 10
    }
  },
}
