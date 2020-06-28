// MIKE: I don't see any reason why these lenses should be coupled to a specific
// query, they should probably be in a different file

import * as R from 'ramda'
import * as L from "partial.lenses"
import * as RA from 'ramda-adjunct'

// lens util

// MIKE: move this to a util file
// MIKE: write a type siganture for this using this notation:
// https://github.com/ramda/ramda/wiki/Type-Signatures
const lenseSelect = R.pipe(
  R.mapObjIndexed(R.ifElse(
    RA.isNotFunction,
    R.unary(L.get),
    R.identity
  )),
  R.applySpec,
)

// lens model
const Model = {
  data: 'data',
}

const Data = {
  gameSessionByPk: 'game_session_by_pk'
}

const GameSessionByPk = {
  host: ['host'],
  completionStatus: ['completion_status'],
  players: ['players']
}

const Host = {
  name: ['name']
}

const Player = {
  user: ['user'],
  userId: ['user_id']
}

const User = {
  name: ['name'],
  id: ['id']
}

Model.playerById = id => [
  Model.data,
  Data.gameSessionByPk,
  GameSessionByPk.players,
  L.find(L.get([
    Player.userId,
    R.equals(id)
  ])),
]

// lens transforms
export const Transform = {
  data: L.get([
    Data.gameSessionByPk,
    lenseSelect({
      hostName: [
        GameSessionByPk.host,
        Host.name
      ],
      completionStatus: GameSessionByPk.completionStatus,
      players: L.collect([
        GameSessionByPk.players,
        L.elems,
        Player.user,
        lenseSelect({
          userId: User.id,
          userName: User.name
        })
      ])
    })
  ]),
}

export const Lens = {
  Model,
  GameSessionByPk,
  Host,
  Player,
  User
}

// MIKE: use this as mock data when you implement unit tests

// const mockData = {
//   "data": {
//     "game_session_by_pk":
//     {
//       "id": 11,
//       "host":
//       {
//         "id": 35,
//         "name": "CuteCollar17135",
//         "__typename": "user"
//       },
//       "completion_status": "not_started",
//       "players":
//         [
//           {
//             "user":
//             {
//               "id": 35,
//               "name": "CuteCollar17135",
//               "__typename": "user"
//             },
//             "game_session_id": 11,
//             "user_id": 35,
//             "__typename": "game_session_user"
//           },
//           {
//             "user":
//             {
//               "id": 36,
//               "name": "CuteBelt17135",
//               "__typename": "user"
//             },
//             "game_session_id": 11,
//             "user_id": 36,
//             "__typename": "game_session_user"
//           }
//         ],
//       "__typename": "game_session"
//     }
//   }
// }


// SCRATCH:
// const playerById = id => [
//   Model.data,
//   Data.gameSessionByPk,
//   GameSessionByPk.players,
//   L.find(L.get([Player.userId, R.equals(id)])),
// ]

// L.get(Model.playerById(35), mockData) // ? 

// const playerByIdIso = id => [
//   Model.data,
//   Data.gameSessionByPk,
//   GameSessionByPk.players,
//   L.normalize(R.sortBy(L.get([Player.userId]))),
//   L.find(L.get([Player.userId, R.equals(id)])),
//   Player.userId,
//   L.is(id)
// ]

// L.get(playerByIdIso(35)) (mockData) // ?
// L.get(playerByIdIso(34)) (mockData) // ?

// const sampleFlags = ['id-19', 'id-76']

// const flag = id => [
//   L.normalize(R.sortBy(R.identity)),
//   L.find(R.equals(id)),
//   L.is(id)
// ]

// L.get(flag('id-69'), sampleFlags) // ?

// L.get(flag('id-76'), sampleFlags) // ?

// L.set(flag('id-69'), true, sampleFlags) // ?

// L.set(flag('id-76'), false, sampleFlags) /// ?
