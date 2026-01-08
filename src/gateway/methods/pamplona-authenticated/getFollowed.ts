import { getUserFromSession } from '../..'

export default {
  name: 'PamplonaAuthenticated.getFollowed',
  execute: async (params: {}, sessionId: string) => {
    const personaId = getUserFromSession(sessionId)

    if (!personaId) {
      throw new Error('Invalid session')
    }

    return []
  },
}
