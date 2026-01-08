import { getUserFromSession } from '../..'

export default {
  name: 'PamplonaAuthenticated.setPlayerGhost',
  execute: async (
    params: { tagData: { bg: { tag: string }; detail: string; frame: string } },
    sessionId: string
  ) => {
    const personaId = getUserFromSession(sessionId)

    if (!personaId) {
      throw new Error('Invalid session')
    }

    return 'success'
  },
}
