import * as R from 'ramda';
import * as L from 'partial.lenses';
import { models, util as U } from "@hasura-guessing-game/lenses";
const { gameSessionByPk: M } = models 

export const gameSessionByPk = {
  data: L.get([
    M.Data.gameSessionByPk,
    U.lensSelect({
      id: M.GameSessionByPk.id,
      hostName: [
        M.GameSessionByPk.host,
        M.Host.name,
      ],
      hostId: [
        M.GameSessionByPk.host,
        M.Host.id,
      ],
      completionStatus: M.GameSessionByPk.completionStatus,
      closestGuesserName: [
        M.GameSessionByPk.closestGuesser,
        M.ClosestGuesser.name,
      ],
      closestGuess: M.GameSessionByPk.closestGuess,
      turnIndex: M.GameSessionByPk.turnIndex,
      winnerName: [
        M.GameSessionByPk.winner,
        M.Winner.name,
      ],
      players: L.collect([
        M.GameSessionByPk.players,
        L.elems,
        M.Player.user,
        U.lensSelect({
          userId: M.User.id,
          userName: M.User.name,
        }),
      ]),
    }),
  ]),
};