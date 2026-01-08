import { ChallengeEntry, Division } from '@prisma/client'
import { getUserFromSession } from '../..'
import db from '../../../common/prisma'

export default {
  name: 'PamplonaAuthenticated.getHackableBillboardFriendsLeaderboard',
  execute: async (
    params: { challengeId: string; radius: number | null },
    session: string
  ) => {
    const personaId = getUserFromSession(session)

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

    const challenge = await db.challengeStat.findFirst({
      where: {
        code: params.challengeId,
      },
    })

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    const qty = params.radius || 5

    // TODO: query for entries NEAR user's entry
    const entries = await db.challengeEntry.findMany({
      where: {
        challengeId: challenge.challengeId,
        AND: {
          challengeStatId: challenge.code,
        },
      },
      orderBy: {
        value: 'desc',
      },
      include: {
        user: {
          select: {
            division: true,
            divisionRank: true,
            name: true,
            personaId: true,
          },
        },
      },
      take: qty,
    })

    const globalCount = await db.challengeEntry.count({
      where: {
        challengeId: challenge.challengeId,
        AND: {
          challengeStatId: challenge.code,
        },
      },
    })

    if (!entries.length) {
      return {
        leaderboard: {
          area: null,
          totalCount: 0,
          users: [],
        },
        globalLeader: null,
      }
    }

    return {
      leaderboard: {
        area: null,
        totalCount: 1,
        users: entries.map(mapEntry),
      },
      globalLeader: mapEntry(entries[0], 0),
      globalCount,
    }
  },
}

const mapEntry = (
  entry: ChallengeEntry & {
    user: {
      personaId: string
      name: string
      division: Division
      divisionRank: number
    }
  },
  index: number
) => ({
  position: index + 1,
  globalRank: index + 1,
  score: entry.value.toString(),
  percentile: null,
  personaId: entry.userId,
  name: entry.user.name,
  division: {
    name: entry.user.division,
    rank: entry.user.divisionRank,
  },
})
