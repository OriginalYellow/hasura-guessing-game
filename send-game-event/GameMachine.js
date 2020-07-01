import { Machine, interpret, assign } from 'xstate';

// MIKE: you should use something like state.nextEvents to determine what
// buttons should be enabled on the client
// (https://xstate.js.org/docs/guides/states.html#state-nextevents)

const calcGuessDistance = (guessValue, secretNumber) => {
  if (guessValue <= secretNumber) {
    return (secretNumber - guessValue);
  }
  else {
    return (guessValue - secretNumber);
  }
}

const updateClosestGuess = assign({
  closestGuess: ({ secretNumber, closestGuess, playerIds, turnIndex }, { value }) => {
    if (
      !closestGuess
      || calcGuessDistance(value) < calcGuessDistance(closestGuess.value)
    ) {
      return {
        playerId: playerIds[turnIndex],
        value
      }
    } else {
      return closestGuess
    }
  }
})

const incrementTurnIndex = assign({
  turnIndex: ({ turnIndex, playerIds }) => {
    if ((turnIndex + 1) == playerIds.length ) {
      return 0
    }

    return turnIndex + 1
  }
})

const enoughPlayers = context => context.playerIds.length > 1

const isClosestGuessersTurn = ({ closestGuess, turnIndex, playerIds }) => {
  if (!closestGuess) {
    return false
  }

  return closestGuess.playerId == playerIds[turnIndex]
}

const setWinner = assign({
  winner: ({ closestGuess: { playerId } }) => playerId 
})

const GameMachine = Machine(
  {
    id: 'game',
    initial: 'not_started',
    states: {
      not_started: {
        on: {
          START: {
            target: 'ongoing',
            cond: 'enoughPlayers'
          }
        }
      },
      ongoing: {
        on: {
          '': [
            { target: 'completed', cond: 'isClosestGuessersTurn' }
          ],
          GUESS: {
            actions: [ 'updateClosestGuess', 'incrementTurnIndex' ]
          }
        }
      },
      completed: {
        entry: setWinner,
        type: 'final'
      }
    },
  },
  {
    actions: {
      updateClosestGuess,
      incrementTurnIndex,
      setWinner
    },
    guards: {
      enoughPlayers,
      isClosestGuessersTurn
    }
  }
);

const createGameMachine = (playerIds, secretNumber) => {
  return GameMachine.withContext({
    secretNumber,
    playerIds,
    closestGuess: null,
    turnIndex: 0,
    winner: null
  })
}

module.exports = createGameMachine