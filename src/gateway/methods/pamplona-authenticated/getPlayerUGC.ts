import { getUserFromSession } from '../..'
import db from '../../../common/prisma'
import { extractUGCData } from '../../helper'

export default {
  name: 'PamplonaAuthenticated.getPlayerUGC',
  execute: async (params: {}, sessionId: string) => {
    const personaId = getUserFromSession(sessionId)

    if (!personaId) {
      throw new Error('Invalid session')
    }

    const user = await db.user.findFirst({
      where: {
        personaId,
      },
      include: {
        userGeneratedContent: {
          where: {
            creatorId: personaId,
          },
          include: {
            reachThis: true,
            timeTrial: true,
            creator: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return {
      playerReachThis: user.userGeneratedContent
        .filter((ugc) => ugc.ugcType === 'ReachThis')
        .map((ugc) => extractUGCData(ugc, ['META'])),
      playerTimeTrials: [],
    }
  },
}
