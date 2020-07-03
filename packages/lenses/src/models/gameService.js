import * as R from 'ramda';
import * as L from 'partial.lenses';

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
  closestGuess: ['closestGuess']
}

export const ClosestGuess = {
  playerId: ['playerId'],
  value: ['value']
}

export const Lens = {
  context: [Model.state, State.context],
}

Lens.closestGuess = [Lens.context, Context.closestGuess]

export const Get = {
  secretNumber: L.get([Lens.context, Context.secretNumber]),
  turnIndex: L.get([Lens.context, Context.turnIndex]),
  winner: L.get([Lens.context, Context.winner]),
  closestGuess: L.get([Lens.closestGuess, ClosestGuess.value]),
  closestGuesserId: L.get([Lens.closestGuess, ClosestGuess.playerId]),
  completionStatus: L.get([Model.state, State.value]),
}