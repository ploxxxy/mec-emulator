import { getUserFromSession } from '../..'
import db from '../../../common/prisma'

export default {
  name: 'PamplonaAuthenticated.revokeKit',
  execute: async (params: { id: string }, session: string) => {
    const kitId = params.id.toLowerCase()

    const personaId = getUserFromSession(session)

    if (!personaId) {
      throw new Error('Invalid session')
    }

    const kitExists = await db.kit.findFirst({
      where: {
        id: kitId,
      },
    })

    if (!kitExists) {
      throw new Error('Kit does not exist')
    }

    const kitUnlockExists = await db.kitUnlock.findFirst({
      where: {
        kitId: kitId,
        userId: personaId,
      },
    })

    if (kitUnlockExists) {
      await db.kitUnlock.delete({
        where: {
          kitId_userId: {
            kitId: kitId,
            userId: personaId,
          },
        },
      })

      return 'success'
    }

    // await db.kitUnlock.create({
    //   data: {
    //     kitId: kitId,
    //     userId: personaId,
    //     opened: false,
    //   },
    // })

    return 'success'
  },
}
