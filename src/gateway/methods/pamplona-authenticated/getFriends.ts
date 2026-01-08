import { getUserFromSession } from '../..'

export default {
  name: 'PamplonaAuthenticated.getFriends',
  execute: async (params: {}, sessionId: string) => {
    const personaId = getUserFromSession(sessionId)

    if (!personaId) {
      throw new Error('Invalid session')
    }

    return []
  },
}
