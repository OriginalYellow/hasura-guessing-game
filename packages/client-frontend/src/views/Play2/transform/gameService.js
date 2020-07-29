import * as R from "ramda";
import * as L from "partial.lenses";
import { models } from "@hasura-guessing-game/lenses";
const { gameService: M } = models

export const gameState = R.applySpec({
  secretNumber: L.get(M.Lens.secretNumber),
  turnIndex: L.get(M.Lens.turnIndex),
  winnerId: L.get(M.Lens.winner),
  closestGuess: L.get(M.Lens.closestGuessValue),
  closestGuesserId: L.get(M.Lens.closestGuesserId),
  completionStatus: L.get(M.Lens.completionStatus),
  notification: L.get(M.Lens.notification),
  nextEvents: L.get(M.Lens.nextEvents),
})
