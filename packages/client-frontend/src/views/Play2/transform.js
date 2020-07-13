import * as R from 'ramda';
import * as L from 'partial.lenses';
import { models } from "@hasura-guessing-game/lenses";
const { gameSessionByPk: M } = models

export const gameSessionByPk = {
  props: R.applySpec({
    id: L.get(M.Data.Lens.id),
    hostName: L.get(M.Data.Lens.hostName),
    hostId: L.get(M.Data.Lens.hostId),
    completionStatus: L.get(M.Data.Lens.completionStatus),
    closestGuesserName: L.get(M.Data.Lens.closestGuesserName),
    closestGuess: L.get(M.Data.Lens.closestGuess),
    turnIndex: L.get(M.Data.Lens.turnIndex),
    winnerName: L.get(M.Data.Lens.winnerName),
    players: L.collect([
      M.Data.Lens.playerUser,
      R.applySpec({
        userId: L.get(M.User.id),
        userName: L.get(M.User.name)
      })
    ]),
    gameEventIds: L.collect([M.Data.Lens.gameEvent, M.GameEvent.id]),
    secretNumber: L.get([M.Data.Lens.secretNumber])
  }),
};

const appendEvent = (event, data) => L.set(
  M.Data.Lens.gameEventById(
    L.get(M.GameEvent.id, event)
  ),
  event,
  data
)

gameSessionByPk.appendEvent = appendEvent