import net from 'node:net'
import { PassThrough } from 'node:stream'
import { Buffer } from 'node:buffer'
import * as Blaze from './blaze'
import * as AssociationLists from './components/association-lists'
import * as Authentication from './components/authentication'
import * as Messaging from './components/messaging'
import * as UserSessions from './components/user-sessions'
import * as Util from './components/util'
import { logger, logPacket } from './helper'
import './redirector'

const blazePort: number = parseInt(process.env.BLAZE_PORT ?? "25565")

const server = net.createServer((socket) => {
  let buffer = Buffer.alloc(0)

  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data])

    while (buffer.length >= 16) {
      const payloadSize = (buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | (buffer[3] << 0)

      if (buffer.length >= payloadSize + 16) {
        const packetData = buffer.subarray(0, payloadSize + 16)
        const dataStream = new PassThrough()
        dataStream.write(packetData)

        const packet = Blaze.Packet.createFromStream(dataStream)
        handleIncomingPacket(packet, socket)

        buffer = buffer.subarray(payloadSize + 16)
      } else {
        break
      }
    }
  })

  socket.on('end', () => {
    logger.info('Connection closed')
  })

  socket.on('error', (error) => {
    logger.error(error)
  })

  socket.on('timeout', () => {
    logger.info('Connection timed out')
    socket.destroy()
  })
})

server.on('listening', () => {
  logger.info(`Server started on port ${blazePort}`)
})

server.listen(blazePort)

const handleIncomingPacket = (packet: Blaze.Packet, socket: net.Socket) => {
  logPacket(packet.header, packet.payload, true)

  switch (packet.header.component) {
    case 0:
      socket.write(packet.encode(packet.header.msgNum))
      break
    case Blaze.Component.Util:
      Util.handleCommand(packet.header.command, packet, socket)
      break
    case Blaze.Component.Authentication:
      Authentication.handleCommand(packet.header.command, packet, socket)
      break
    case Blaze.Component.UserSessions:
      UserSessions.handleCommand(packet.header.command, packet, socket)
      break
    case Blaze.Component.AssociationLists:
      AssociationLists.handleCommand(packet.header.command, packet, socket)
      break
    case Blaze.Component.Messaging:
      Messaging.handleCommand(packet.header.command, packet, socket)
      break
    default:
      throw new Error('Unhandled component: ' + packet.header.component)
  }
}
