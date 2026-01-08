import Fastify from 'fastify'
import { JSONRPCRequest, JSONRPCServer } from 'json-rpc-2.0'
import fs from 'node:fs'
import { chunkStringFixed, logger, monkeyStringify } from './helper'
import { Readable } from 'node:stream'

export interface ServerParams {
  session: string | undefined
}
const server = new JSONRPCServer<ServerParams>()

const folders = fs.readdirSync(__dirname + '/methods')
for (const folder of folders) {
  const methods = fs.readdirSync(__dirname + '/methods/' + folder)

  for (const method of methods) {
    import('./methods/' + folder + '/' + method)
      .then((m) => m.default)
      .then((m) => {
        if ('name' in m && 'execute' in m) {
          logger.info(`Registering method ${m.name}`)
          server.addMethod(m.name, m.execute)
        } else {
          logger.warn(`Error loading method ${method}`)
        }
      })
  }
}

const fastify = Fastify({
  // logger: true,
})

fastify.options('*', (req, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', 'POST')
  reply.header('Access-Control-Allow-Headers', 'Content-Type, X-GatewaySession')
  reply.send()
})

fastify.addContentTypeParser(
  'application/x-encrypted',
  { parseAs: 'buffer' },
  (req, body, done) => {
    logger.debug('Received encrypted request')
    console.log(body.toString('hex'))

    // reply.send({ jsonrpc: '2.0', id: null, result: null })
    done(null, req.body)
  }
)

fastify.post('*', (req, reply) => {
  const jsonRPCRequest = req.body as JSONRPCRequest

  // original server behavior
  jsonRPCRequest.id = jsonRPCRequest.id?.toString() || null

  const session = req.headers['x-gatewaysession'] as string | undefined

  const method = jsonRPCRequest.method

  server.receive(jsonRPCRequest, { session }).then((response) => {
    logger.debug(method)
    logger.debug(jsonRPCRequest.params)
    // console.log('res', response?.result)

    if (!response || response.error) {
      logger.error(`Error ${response?.error.message}`)
    }

    reply.raw.setHeader('Date', new Date().toUTCString())
    reply.raw.setHeader('Content-Type', 'application/json;charset=utf-8')
    reply.raw.setHeader('Transfer-Encoding', 'chunked')
    reply.raw.setHeader('Connection', 'close')
    reply.raw.setHeader('Access-Control-Allow-Origin', '*')

    if (!response) {
      return reply.send(
        // chunkStringFixed(
          monkeyStringify({ jsonrpc: '2.0', id: null, result: null })
        // )
      )
    }

    return reply.send(
      // chunkStringFixed(
        monkeyStringify(response as unknown as Record<string, unknown>)
      // )
    )
    // return reply.send(response)
  })
})

try {
  const nodePort: number = parseInt(process.env.GATEWAY_PORT ?? "3000")
  fastify.listen({ port: nodePort, host: '0.0.0.0' })
  logger.debug(`Gateway listening on port ${nodePort}`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}

export function getUserFromSession(sessionId: string) {
  return process.env.PERSONA_ID ?? "133713371337"
}
