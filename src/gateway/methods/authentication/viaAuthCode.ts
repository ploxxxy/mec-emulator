import { randomUUID } from 'crypto'

const personaId: number = parseInt(process.env.PERSONA_ID ?? "133713371337");

export default {
  name: 'Authentication.viaAuthCode',
  execute(params: { authCode: string }) {
    return {
      sessionId: '00000000-0000-0000-0000-000000000000',
      personaId: `'${personaId}'`,
    }
  },
}
