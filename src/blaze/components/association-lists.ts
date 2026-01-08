import { Socket } from 'node:net'
import {
  TDF,
  TDFIntVector3,
  TDFInteger,
  TDFList,
  TDFString,
  TDFStruct,
  TDFType,
} from 'tdf.js'
import * as Blaze from '../blaze'

export enum Commands {
  addUsersToList = 1,
  removeUsersFromList = 2,
  clearLists = 3,
  setUsersToList = 4,
  getListForUser = 5,
  getLists = 6,
  subscribeToLists = 7,
  unsubscribeFromLists = 8,
  getConfigListsInfo = 9,
  getMemberHash = 10,
  setUsersAttributesInList = 13,
}

export const handleCommand = (
  command: Commands,
  packet: Blaze.Packet,
  socket: Socket
) => {
  switch (command) {
    case Commands.getLists:
      // socket.write(getLists().encode(packet.header.msgNum)) // crasher
      break
    default:
      throw new Error('Unhandled command: ' + command)
  }
}

const personaId: number = parseInt(process.env.PERSONA_ID ?? "133713371337");

const getLists = () => {
  const header = {
    payloadSize: 369,
    metadataSize: 0,
    component: Blaze.Component.AssociationLists,
    command: Commands.getLists,
    msgNum: 6,
    msgType: Blaze.MessageType.REPLY,
    options: 0,
    reserved: 0,
  }

  const payload: TDF[] = [
    new TDFList('LMAP', TDFType.Struct, 3, [
      [
        new TDFStruct('INFO', [
          // Unique blaze object id for the association list.
          new TDFIntVector3('BOID', [25, 1, personaId]),
          // Flags that represent additional information about this AssociationList.
          new TDFInteger('FLGS', 4),
          // Id for the association list.
          new TDFStruct('LID ', [
            // Name for the association list
            new TDFString('LNM ', 'friendList'),
            // Type identifier for the association list.
            new TDFInteger('TYPE', 1),
          ]),
          // Max size for the association list.
          new TDFInteger('LMS ', 2000),
          // Name for the Pair/Paired list.
          new TDFString('PNAM', ''),
          // Indicates the corresponding Pair/Paired list.
          new TDFInteger('PRID', 0),
          // Max size for the Pair/Paired list.
          new TDFInteger('PRMS', 0),
        ]),
        // // FIXME: crashes the game (tdf.js struct of tdfs issue)
        // // Members of the association list.
        // new TDFList('MEML', TDFType.Struct, 1, [
        //   [
        //     // List member id.
        //     new TDFStruct('LMID', [
        //       // Attributes for list member
        //       new TDFInteger('ATTR', 0),
        //       // Client platform type
        //       new TDFInteger('PLAT', 4),
        //       // User core identification
        //       new TDFStruct('USER', [
        //         new TDFBlob('EXBB', Buffer.from('')),
        //         new TDFInteger('EXID', 2809387553),
        //         new TDFInteger('ID  ', 809663717),
        //         new TDFString('NAME', 'CodeNameMeteor'),
        //         new TDFString('NASP', 'cem_ea_id'),
        //       ]),
        //       // Time of the member added to the list.
        //       new TDFInteger('TIME', 1700257741),
        //     ]),
        //   ],
        // ]),
        // Offset (Just echo back the value. (?) )
        new TDFInteger('OFRC', 0),
        // The total count of a list.
        // FIXME: don't forget to update this value.
        // new TDFInteger('TOCT', 1),
        new TDFInteger('TOCT', 0),
      ],
      [
        new TDFStruct('INFO', [
          new TDFIntVector3('BOID', [25, 5, personaId]),
          new TDFInteger('FLGS', 2),
          new TDFStruct('LID ', [
            new TDFString('LNM ', 'followList'),
            new TDFInteger('TYPE', 5),
          ]),
          new TDFInteger('LMS ', 200),
          new TDFString('PNAM', 'followerList'),
          new TDFInteger('PRID', 6),
          new TDFInteger('PRMS', 50000),
        ]),
        new TDFInteger('OFRC', 0),
        new TDFInteger('TOCT', 0),
      ],
      [
        new TDFStruct('INFO', [
          new TDFIntVector3('BOID', [25, 4, personaId]),
          new TDFInteger('FLGS', 0),
          new TDFStruct('LID ', [
            new TDFString('LNM ', 'communicationBlockList'),
            new TDFInteger('TYPE', 4),
          ]),
          new TDFInteger('LMS ', 100),
          new TDFString('PNAM', ''),
          new TDFInteger('PRID', 0),
          new TDFInteger('PRMS', 0),
        ]),
        new TDFInteger('OFRC', 0),
        new TDFInteger('TOCT', 0),
      ],
    ]),
  ]

  return new Blaze.Packet(header, payload)
}
