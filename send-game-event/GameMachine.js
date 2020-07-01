import { Machine, interpret, assign } from 'xstate';

// MIKE: you should use something like state.nextEvents to determine what
// buttons should be enabled on the client
// (https://xstate.js.org/docs/guides/states.html#state-nextevents)

// MIKE: you need to prevent players from guessing if it is not their turn. You
// will be decoding their user id from their token, so you can depend the
// "playerId" being accurate

// MIKE: organize these free functions into namespaces 

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const calcGuessDistance = (guessValue, secretNumber) => {
  if (guessValue <= secretNumber) {
    return (secretNumber - guessValue);
  } else {
    return (guessValue - secretNumber);
  }
}

const updateClosestGuess = assign({
  closestGuess: ({ secretNumber, closestGuess, playerIds, turnIndex }, { value }) => {
    if (
      !closestGuess
      || (
          calcGuessDistance(value, secretNumber)
          < calcGuessDistance(closestGuess.value, secretNumber)
        )
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
    if ((turnIndex + 1) == playerIds.length) {
      return 0
    }

    return turnIndex + 1
  }
})

const setWinner = assign({
  winner: ({ closestGuess: { playerId } }) => playerId
})

const setSecretNumber = assign({
  secretNumber: () => getRandomInt(-100, 100)
})

const mockSetSecretNumber = assign({
  secretNumber: () => 50
})

const enoughPlayers = context => context.playerIds.length > 1

const isClosestGuessersTurn = ({ closestGuess, turnIndex, playerIds }) => {
  if (!closestGuess) {
    return false
  }

  return closestGuess.playerId == playerIds[turnIndex]
}

const isGuessersTurn = ({ turnIndex, playerIds }, { playerId }) => {
  return playerId == playerIds[turnIndex]
}

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
        },
        exit: 'setSecretNumber'
      },
      ongoing: {
        on: {
          '': [
            { target: 'completed', cond: 'isClosestGuessersTurn' }
          ],
          GUESS: {
            cond: 'isGuessersTurn',
            actions: ['updateClosestGuess', 'incrementTurnIndex']
          }
        }
      },
      completed: {
        entry: 'setWinner',
        type: 'final'
      }
    },
  },
  {
    actions: {
      updateClosestGuess,
      incrementTurnIndex,
      setWinner,
      // setSecretNumber
      setSecretNumber: mockSetSecretNumber
    },
    guards: {
      enoughPlayers,
      isClosestGuessersTurn,
      isGuessersTurn
    }
  }
);

const createGameMachine = playerIds => {
  return GameMachine.withContext({
    secretNumber: null,
    playerIds,
    closestGuess: null,
    turnIndex: 0,
    winner: null
  })
}

module.exports = createGameMachine