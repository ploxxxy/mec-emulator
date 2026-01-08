import { PrismaClient } from '@prisma/client'
import { seed as customization } from './customization'
import { seed as namedChallenges } from './namedChallenges'
import { seed as progression } from './progression'

const prisma = new PrismaClient()

async function main() {
  await Promise.all([
    customization(prisma),
    namedChallenges(prisma),
    progression(prisma),
  ])

  await prisma.user.create({
    data: {
      name: process.env.PERSONA_USERNAME ?? "ploxxxxxxy",
      personaId: process.env.PERSONA_ID ?? "133713371337",
      division: 'Gold',
      divisionRank: 1,
      tagData: {
        create: {
          frame: '2573550572',
          bg: '232356850',
          detail: '3420869487',
        },
      },
      userStats: {
        create: {
          stats: {}
        }
      }
      // itemUnlocks: {
      //   createMany: {
      //     data: items.map((reward) => ({
      //       itemId: reward.id,
      //     })),
      //   },
      // },
      // kitUnlocks: {
      //   createMany: {
      //     data: kits.map((kit) => ({
      //       kitId: kit.id.toLowerCase(),
      //       opened: kit.opened,
      //     })),
      //   },
      // },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
