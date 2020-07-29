import * as RA from 'ramda-adjunct'
import * as R from 'ramda'
import * as L from 'partial.lenses'

export const Model = {
  state: ['state'],
};

export const State = {
  context: ['context'],
  value: ['value'],
}

export const Context = {
  secretNumber: ['secretNumber'],
  turnIndex: ['turnIndex'],
  winner: ['winner'],
  closestGuess: ['closestGuess'],
  message: ['message']
}

export const ClosestGuess = {
  playerId: ['playerId'],
  value: ['value']
}

export const Lens = {
  context: [Model.state, State.context],
}

Lens.closestGuess = [Lens.context, Context.closestGuess]
Lens.secretNumber = [Lens.context, Context.secretNumber]
Lens.turnIndex = [Lens.context, Context.turnIndex]
Lens.winner = [Lens.context, Context.winner]
Lens.message = [Lens.context, Context.message]
Lens.closestGuessValue = [Lens.closestGuess, ClosestGuess.value]
Lens.closestGuesserId = [Lens.closestGuess, ClosestGuess.playerId]
Lens.completionStatus = [
  Model.state,
  State.value,
  L.cond(
    [RA.isString, L.identity],
    [RA.isObj, R.pipe(R.keys, R.head)],
  )
]
