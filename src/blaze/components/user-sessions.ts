import {
  TDF,
  TDFBlob,
  TDFDictionary,
  TDFIntVector3,
  TDFInteger,
  TDFIntegerList,
  TDFList,
  TDFString,
  TDFStruct,
  TDFType,
  TDFUnion,
} from 'tdf.js'
import { Socket } from 'node:net'
import * as Blaze from '../blaze'

const personaId: number = parseInt(process.env.PERSONA_ID ?? "133713371337");
const userId: number = parseInt(process.env.USER_ID ?? "133713371337")
const personaUsername: string = process.env.PERSONA_USERNAME ?? "ploxxxxxxy";

export enum Commands {
  validateSessionKey = 1,
  userSessionExtendedData = 2,
  fetchExtendedData = 3,
  updateExtendedDataAttribute = 5,
  updateHardwareFlags = 8,
  lookupUser = 12,
  lookupUsers = 13,
  lookupUsersByPrefix = 14,
  lookupUsersIdentification = 15,
  updateNetworkInfo = 20,
  lookupUserGeoIPData = 23,
  overrideUserGeoIPData = 24,
  updateUserSessionClientData = 25,
  setUserInfoAttribute = 26,
  resetUserGeoIPData = 27,
  lookupUserSessionId = 32,
  fetchLastLocaleUsedAndAuthError = 33,
  fetchUserFirstLastAuthTime = 34,
  setUserGeoOptIn = 37,
  enableUserAuditLogging = 41,
  disableUserAuditLogging = 42,
  getUniqueDeviceId = 45,
  lookupUsersByPrefixMultiNamespace = 47,
  lookupUsersByPersonaNameMultiNamespace = 48,
  lookupUsersByPersonaNamesMultiNamespace = 49,
  lookupUsersByPersonaNames = 50,
  forceOwnSessionLogout = 54,
  updateLocalUserGroup = 55,
}

export const handleCommand = (
  command: Commands,
  packet: Blaze.Packet,
  socket: Socket
) => {
  switch (command) {
    case Commands.updateHardwareFlags:
      socket.write(updateHardwareFlags().encode(packet.header.msgNum))
      break
    case Commands.updateNetworkInfo:
      socket.write(updateNetworkInfo().encode(packet.header.msgNum))
      socket.write(validateSessionKey().encode(0))
      break
    default:
      throw new Error('Unhandled command: ' + command)
  }
}

export const userSessionExtendedData = () => {
  const header = {
    payloadSize: 202,
    metadataSize: 0,
    component: Blaze.Component.UserSessions,
    command: Commands.userSessionExtendedData,
    msgNum: 0,
    msgType: Blaze.MessageType.NOTIFICATION,
    options: 0,
    reserved: 0,
  }

  const payload: TDF[] = [
    new TDFStruct('DATA', [
      // Network address of the user as determined by QOS and desired gameport.
      new TDFUnion('ADDR', 127, new TDFString('BPS ', '')),
      // Country Code provided by the GeoIp database.
      new TDFString('CTY ', ''),
      // An variable tdf set by the client.
      new TDFIntegerList('CVAR', []),
    ]),
    // An integer keyed map of data specific to this user.
    new TDFDictionary('DMAP', 0, 0, 1, {
      '2013396993': 0,
    }),
    // Hardware flags.
    new TDFInteger('HWFG', 0),
    // ISP provided by the GeoIP database.
    new TDFString('ISP ', ''),
    // Bandwidth and NAT type info.
    new TDFStruct('QDAT', [
      new TDFInteger('BWHR', 0),
      new TDFInteger('DBPS', 0),
      new TDFInteger('NAHR', 0),
      new TDFInteger('NATT', 0),
      new TDFInteger('UBPS', 0),
    ]),
    // Time zone provided by the GeoIP database.
    new TDFString('TZ  ', ''),
    // Custom user info attribute.
    new TDFInteger('UATT', 0),
    // A list of BlazeObjectIds that the user session belongs to.
    new TDFList('ULST', 9, 1, [[30722, 2, 88123840]]),
    new TDFStruct('USER', [
      // The master account id
      new TDFInteger('AID ', userId),
      // The user's account locale
      new TDFInteger('ALOC', 1920292161),
      new TDFBlob('EXBB', Buffer.alloc(0)),
      // The user's ExternaId
      new TDFInteger('EXID', userId),
      // The user's BlazeId
      new TDFInteger('ID  ', personaId),
      // The persona name of the user
      new TDFString('NAME', personaUsername),
      // The persona namespace for mName.
      new TDFString('NASP', 'cem_ea_id'),
      // The user's Origin persona id
      new TDFInteger('ORIG', personaId),
      // The user's Pid Id
      new TDFInteger('PIDI', 0),
    ]),
  ]

  return new Blaze.Packet(header, payload)
}

export const updateHardwareFlags = () => {
  const header = {
    payloadSize: 216,
    metadataSize: 0,
    component: Blaze.Component.UserSessions,
    command: Commands.updateHardwareFlags,
    msgNum: 0,
    msgType: Blaze.MessageType.NOTIFICATION,
    options: 1,
    reserved: 0,
  }

  const payload: TDF[] = [
    // True if this is the first time the user has logged on to this Blaze server on the Console (not a Web login) & has external data set
    new TDFInteger('1CON', 0),
    // The user's account locale
    new TDFInteger('ALOC', 1920292161),
    // The unique BlazeId assigned to the user account associated with this session
    new TDFInteger('BUID', personaId),
    // The connection group id for users accross a shared conneciton.
    new TDFIntVector3('CGID', [30722, 2, 88123840]),
    // Persona name
    new TDFString('DSNM', personaUsername),
    // True if this is the first time the user has logged on to this Blaze server
    new TDFInteger('FRST', 0),
    // The SessionKey created by the Blaze server for this session
    new TDFString(
      'KEY ',
      '0540000031e5dde8_wT9NlhYTUidv3EMiZo7kaRMYV0x3$x72YrtOC*QU1v'
    ),
    // Last authentication timestamp for persona
    new TDFInteger('LAST', 1700769152),
    // provides the data/time this user was last authenticated by this Blaze server
    new TDFInteger('LLOG', 1700769258),
    new TDFString('MAIL', '******@ukr.net'),
    // Persona namespace
    new TDFString('NASP', 'cem_ea_id'),
    // Nucleus personaId
    new TDFInteger('PID ', personaId),
    // Client platform type
    new TDFInteger('PLAT', 4),
    // The Nucleus account id for the user associated with this session
    new TDFInteger('UID ', userId),
    // The type of user logging in
    new TDFInteger('USTP', 0),
    // External reference value such as XUID
    new TDFInteger('XREF', userId),
  ]

  return new Blaze.Packet(header, payload)
}

export const updateExtendedDataAttribute = () => {
  const header = {
    payloadSize: 14,
    metadataSize: 0,
    component: Blaze.Component.UserSessions,
    command: Commands.updateExtendedDataAttribute,
    msgNum: 0,
    msgType: Blaze.MessageType.NOTIFICATION,
    options: 0,
    reserved: 0,
  }

  const payload: TDF[] = [
    new TDFInteger('FLGS', 3),
    new TDFInteger('ID  ', personaId),
  ]

  return new Blaze.Packet(header, payload)
}

const updateNetworkInfo = () => {
  const header = {
    payloadSize: 0,
    metadataSize: 0,
    component: Blaze.Component.UserSessions,
    command: Commands.updateNetworkInfo,
    msgNum: 0,
    msgType: Blaze.MessageType.REPLY,
    options: 0,
    reserved: 0,
  }

  const payload: TDF[] = []
  return new Blaze.Packet(header, payload)
}

const validateSessionKey = () => {
  const header = {
    payloadSize: 190,
    metadataSize: 0,
    component: Blaze.Component.UserSessions,
    command: Commands.validateSessionKey,
    msgNum: 0,
    msgType: Blaze.MessageType.NOTIFICATION,
    options: 0,
    reserved: 0,
  }

  const payload: TDF[] = [
    new TDFStruct('DATA', [
      new TDFUnion(
        'ADDR',
        0x02,
        new TDFStruct('VALU', [
          new TDFStruct('EXIP', [
            new TDFInteger('IP  ', 2960127744),
            new TDFInteger('MACI', 0),
            new TDFInteger('PORT', 3659),
          ]),
          new TDFStruct('INIP', [
            new TDFInteger('IP  ', 3232235838),
            new TDFInteger('MACI', 0),
            new TDFInteger('PORT', 3659),
          ]),
          new TDFInteger('MACI', 1129238128),
        ])
      ),
      new TDFString('BPS ', ''),
      new TDFString('CTY ', ''),
      new TDFIntegerList('CVAR', []),
      new TDFDictionary('DMAP', TDFType.Integer, TDFType.Integer, 1, {
        2013396993: 0,
      }),
      new TDFInteger('HWFG', 0),
      new TDFString('ISP ', ''),
      new TDFStruct('QDAT', [
        new TDFInteger('BWHR', 0),
        new TDFInteger('DBPS', 0),
        new TDFInteger('NAHR', 0),
        new TDFInteger('NATT', 0),
        new TDFInteger('UBPS', 0),
      ]),
      new TDFString('TZ  ', ''),
      new TDFInteger('UATT', 0),
      new TDFList('ULST', TDFType.IntVector3, 1, [[30722, 2, 88123840]]),
    ]),
    new TDFInteger('SUBS', 1),
    new TDFInteger('USID', personaId),
  ]

  return new Blaze.Packet(header, payload)
}
