const personaId: number = parseInt(process.env.PERSONA_ID ?? "133713371337");

export default {
  name: 'Pamplona.getPlayerGhosts',
  execute() {
    return [
      {
        personaId: `'${personaId}'`,
        ghostData: {
          customization: {
            variation: '755475321',
          },
          timestamp: {
            timestampValue: '1700842406',
          },
        },
      },
    ]
  },
}
