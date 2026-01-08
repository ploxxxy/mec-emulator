import { getUserFromSession } from '../..'
import db from '../../../common/prisma'

export default {
  name: 'PamplonaAuthenticated.getHackableBillboardFriendsLeaders',
  execute: async (params: { challengeIds: string[] }, sessionId: string) => {
    const personaId = getUserFromSession(sessionId)

    if (!personaId) {
      throw new Error('Invalid session')
    }

    const user = await db.user.findFirst({
      where: {
        personaId,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // TODO: query all friends
    const entries = await db.challengeEntry.findMany({
      where: {
        userId: personaId,
        challengeStatId: {
          in: params.challengeIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    const returnObject: Record<string, unknown> = params.challengeIds.reduce(
      (acc, challengeId) => { return { [challengeId]: null, ...acc } },
      {}
    )

    for (const entry of entries) {
      returnObject[entry.challengeStatId] = {
        position: 1,
        score: entry.value,
        personaId: entry.userId,
        name: entry.user.name,
      }
    }

    return returnObject
  },
}
