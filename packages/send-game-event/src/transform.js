import * as R from 'ramda'
import * as L from 'partial.lenses'
import { models } from "@hasura-guessing-game/lenses";
const { gameService: { Lens } } = models

export const gameService = {
  model: R.applySpec({
    secret_number: L.get(Lens.secretNumber),
    turn_index: L.get(Lens.turnIndex),
    winner_id: L.get(Lens.winner),
    closest_guess: L.get(Lens.closestGuessValue),
    closest_guesser_id: L.get(Lens.closestGuesserId),
    completion_status: L.get(Lens.completionStatus),
  }),
};