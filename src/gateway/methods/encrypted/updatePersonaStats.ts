import { getUserFromSession } from '../..'
import db from '../../../common/prisma'

export default {
  name: 'PamplonaAuthenticated.updatePersonaStats',
  execute: async (
    params: { stats: { [key: string]: number } },
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

    await db.$executeRaw`
      UPDATE "UserStats"
      SET stats = stats || ${JSON.stringify(params.stats)}::jsonb
      WHERE "userId" = ${personaId}
    `

    // await db.$transaction(
    //   Object.entries(params.stats)
    //     // .filter(([flag]) => {
    //     //   // Skip all of the Mission Available flags as the game spams them
    //     //   if (flag.includes('Available')) return
    //     // })
    //     .map(([flag, value]) => {
    //       return db.userStats.upsert({
    //         where: { userId_flag: { userId: user.personaId, flag } },
    //         create: { userId: user.personaId, flag, value },
    //         update: { value },
    //       })
    //     })
    // )

    return 'success'
  },
}
