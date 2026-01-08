import { ReachThis, TimeTrial, Ugc, UgcEntry, User } from '@prisma/client'
import { randomUUID } from 'crypto'
import pino from 'pino'
import { Readable } from 'stream'

export const logger = pino({
  msgPrefix: '[Gateway] ',
  level: 'debug',
})

interface BaseUGCData {
  meta: {
    ugcId: {
      userId: string
      id: string
    }
    name: string
    creatorName: string
    createdAt: string
    updatedAt: string
    published: boolean
    reported: boolean
    blocked: boolean
    levelId: number
    transform: {
      x: number
      y: number
      z: number
      qx: number
      qy: number
      qz: number
      qw: number
    }
    typeId: 'ReachThis' | 'TimeTrial'
  } | null
}

export interface ReachThisData extends BaseUGCData {
  meta:
    | (BaseUGCData['meta'] & {
        mapPosition: {
          x: number
          y: number
          z: number
        }
        typeId: 'ReachThis'
      })
    | null
  stats: null
  userStats: {
    reachedAt: string
  } | null
  userRank: {
    rank: number
    score: string
    total: number
  } | null
}

export interface TimeTrialData extends BaseUGCData {
  meta:
    | (BaseUGCData['meta'] & {
        teleportTransform: {
          x: number
          y: number
          z: number
          qx: number
          qy: number
          qz: number
          qw: number
        }
        ugcUrl: string
        typeId: 'TimeTrial'
      })
    | null
  stats: null
  userStats: {
    finishedAt: string
    finishTime: string
    splitTimes: string[]
    extraStats: {
      wallrun_distance: string
      maxperframe_distance: string
      walk_distance: string
      total_distance: string
    }
  } | null
  userRank: {
    rank: number
    score: string
    total: number
  } | null
}

interface ExtendedUgc extends Ugc {
  reachThis?: ReachThis | null
  timeTrial?: TimeTrial | null
  creator: Pick<User, 'name'>
  ugcEntries?: UgcEntry[]
}

export const extractUGCData = (
  ugc: ExtendedUgc,
  dataTypes: ('META' | 'STATS' | 'USER_STATS')[] | string[]
): ReachThisData | TimeTrialData | null => {
  const needMeta = dataTypes.includes('META')
  const needUserStats = dataTypes.includes('USER_STATS')
  const ugcEntry = ugc.ugcEntries?.[0] ?? null

  if (ugc.ugcType === 'ReachThis') {
    const userStats = ugcEntry
      ? {
          reachedAt: ugcEntry.finishedAt,
        }
      : null

    const userRank = ugcEntry
      ? {
          rank: 1, // TODO: Implement ranking
          score: ugcEntry.finishedAt,
          total: 1,
        }
      : null

    return {
      meta: needMeta
        ? {
            ugcId: {
              userId: ugc.creatorId,
              // temp for promoted ugc testing
              id: ugc.reachThis?.id || randomUUID(),
            },
            name: ugc.name,
            creatorName: ugc.creator.name,
            createdAt: ugc.createdAt,
            updatedAt: ugc.updatedAt,
            published: ugc.published,
            reported: false,
            blocked: false,
            levelId: -1940918635,
            transform: {
              x: new Float(ugc.transformX),
              y: new Float(ugc.transformY),
              z: new Float(ugc.transformZ),
              qx: new Float(ugc.transformQx),
              qy: new Float(ugc.transformQy),
              qz: new Float(ugc.transformQz),
              qw: new Float(ugc.transformQw),
            },
            mapPosition: {
              // Fixes map icon offset
              // x: ugc.reachThis.mapPositionX,
              // y: ugc.reachThis.mapPositionY,
              // z: ugc.reachThis.mapPositionZ,
              x: ugc.transformX,
              y: ugc.transformY,
              z: ugc.transformZ,
            },
            typeId: 'ReachThis',
          }
        : null,
      stats: null,
      userStats: needUserStats ? userStats : null,
      userRank: needUserStats ? userRank : null,
    }
  } else if (ugc.ugcType === 'TimeTrial') {
    const userStats = ugcEntry
      ? {
          finishedAt: ugcEntry.finishedAt,
          finishTime: ugcEntry.finishedAt,
          splitTimes: ugcEntry.splitTimes,
          extraStats: {
            wallrun_distance: ugcEntry.wallrunDistance || '0',
            maxperframe_distance: ugcEntry.maxperframeDistance || '0',
            walk_distance: ugcEntry.walkDistance || '0',
            total_distance: ugcEntry.totalDistance || '0',
          },
        }
      : null

    const userRank = ugcEntry
      ? {
          // TODO: Implement ranking
          rank: 1,
          score: ugcEntry.finishedAt,
          total: 1,
        }
      : null

    return {
      meta: needMeta
        ? {
            ugcId: {
              userId: ugc.creatorId,
              // temp for promoted ugc testing
              id: ugc.timeTrial?.id || randomUUID(),
            },
            name: ugc.name,
            creatorName: ugc.creator.name,
            createdAt: ugc.createdAt,
            updatedAt: ugc.updatedAt,
            published: ugc.published,
            reported: false,
            blocked: false,
            levelId: -1940918635,
            transform: {
              x: new Float(ugc.transformX),
              y: new Float(ugc.transformY),
              z: new Float(ugc.transformZ),
              qx: new Float(ugc.transformQx),
              qy: new Float(ugc.transformQy),
              qz: new Float(ugc.transformQz),
              qw: new Float(ugc.transformQw),
            },
            teleportTransform: {
              x: new Float(ugc.transformX),
              y: new Float(ugc.transformY),
              z: new Float(ugc.transformZ),
              qx: new Float(ugc.transformQx),
              qy: new Float(ugc.transformQy),
              qz: new Float(ugc.transformQz),
              qw: new Float(ugc.transformQw),
              // x: ugc.timeTrial.teleportTransformX,
              // y: ugc.timeTrial.teleportTransformY,
              // z: ugc.timeTrial.teleportTransformZ,
              // qx: ugc.timeTrial.teleportTransformQx || 0.000001,
              // qy: ugc.timeTrial.teleportTransformQy,
              // qz: ugc.timeTrial.teleportTransformQz || 0.000001,
              // qw: ugc.timeTrial.teleportTransformQw,
            },
            // ugcUrl: `https://mec-gw.ops.dice.se/ugc/prod_default/prod_default/pc/TimeTrial/${ugc.creatorId}/${ugc.timeTrial.id}`,
            ugcUrl: `https://mec-gw.ops.dice.se/ugc/prod_default/prod_default/pc/TimeTrial/${ugc.creatorId}/${randomUUID()}`,
            typeId: 'TimeTrial',
          }
        : null,
      stats: null,
      userStats: needUserStats ? userStats : null,
      userRank: needUserStats ? userRank : null,
    }
  } else {
    return null
  }
}

export const chunkStringFixed = (str: string) => {
  const chunkSize = 16000

  const readable = new Readable({ objectMode: true })
  let index = 0
  readable._read = async () => {
    if (index >= str.length) {
      readable.push(null)
      return
    }

    const end = Math.min(index + chunkSize, str.length)
    const chunk = str.substring(index, end)
    index = end

    // await new Promise((resolve) => setTimeout(resolve, 10))

    readable.push(chunk)
  }

  return readable
}

export class Float extends Number {}
export function monkeyStringify(obj?: object): string {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return value(obj)
  }
  return `{${Object.keys(obj)
    .map((k) =>
      typeof obj[k] === 'function' ? null : `"${k}":${value(obj[k])}`
    )
    .filter((i) => i)}}`
}
function value(val: unknown): string | undefined {
  switch (typeof val) {
    case 'string':
      return `"${val.replace(/\\/g, '\\\\').replace('"', '\\"')}"`
    case 'number':
    case 'boolean':
      return `${val}`
    case 'function':
      console.log('got function')
      return 'null'
    case 'object':
      if (val instanceof Date) return `"${val.toISOString()}"`
      if (val instanceof Float)
        return Number.isInteger(Number(val)) ? `${val}.0` : `${val}`
      if (Array.isArray(val)) return `[${val.map(value).join(',')}]`
      if (val === null) {
        return 'null'
      }
      return monkeyStringify(val)
  }
}

// export function monkeyStringify(obj: object): string {
//   return `{${Object.keys(obj)
//     .map((k) =>
//       `"${k}":${(obj[k] instanceof Float) ? Number.isInteger(Number(obj[k])) ? `${obj[k]}.0` : `${obj[k]}` : JSON.stringify(obj[k])}`
//     )}}`
// }
