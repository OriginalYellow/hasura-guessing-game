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
Lens.secretNumber = [Lens.context, Context.secretNumber]
Lens.turnIndex = [Lens.context, Context.turnIndex]
Lens.winner = [Lens.context, Context.winner]
Lens.closestGuessValue = [Lens.closestGuess, ClosestGuess.value]
Lens.closestGuesserId = [Lens.closestGuess, ClosestGuess.playerId]
Lens.completionStatus = [Model.state, State.value]