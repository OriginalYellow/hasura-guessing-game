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
  data: 'data'
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
  user: ['user']
}

const User = {
  name: ['name'],
  id: ['id']
}

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
