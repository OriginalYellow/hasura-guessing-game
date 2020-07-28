import * as R from 'ramda';
import * as L from 'partial.lenses';
import { models } from "@hasura-guessing-game/lenses";
const { gameSessionByPk: M } = models

export const props = R.applySpec({
  id: L.get(M.Data.Lens.id),
  hostName: L.get(M.Data.Lens.hostName),
  hostId: L.get(M.Data.Lens.hostId),
  secretNumber: L.get(M.Data.Lens.secretNumber),
  players: L.collect([
    M.Data.Lens.playerUser,
    R.applySpec({
      userId: L.get(M.User.id),
      userName: L.get(M.User.name)
    })
  ]),
  gameEvents: L.collect([
    M.Data.Lens.gameEvent,
    R.converge(
      R.mergeLeft,
      [
        R.applySpec({
          type: L.get(M.GameEvent.eventType),
          playerId: L.get(M.GameEvent.userId)
        }),
        L.get(M.GameEvent.payload),
      ]
    )
  ]),
})

export const appendEvent = (event, data) => L.set(
  M.Data.Lens.gameEventById(
    L.get(M.GameEvent.id, event)
  ),
  event,
  data
)