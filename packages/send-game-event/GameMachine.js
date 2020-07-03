import { Machine, interpret, assign } from 'xstate'

// MIKE: you should use something like state.nextEvents to determine what
// buttons should be enabled on the client
// (https://xstate.js.org/docs/guides/states.html#state-nextevents)

// MIKE: organize these free functions into namespaces 

const isHostStarting = ({ hostId }, { playerId }) => hostId == playerId

const enoughPlayers = context => context.playerIds.length > 1

// MIKE: make this pure and compose it with ramda when you introduce that
const canStart = (context, event) => {
  if (!isHostStarting(context, event)) {
    return false
  }

  return enoughPlayers(context, event)
}

export const getRandomInt = (min, max) => {
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


const isClosestGuessersTurn = ({ closestGuess, turnIndex, playerIds }) => {
  if (!closestGuess) {
    return false
  }

  return closestGuess.playerId == playerIds[turnIndex]
}

const isGuessersTurn = ({ turnIndex, playerIds }, { playerId }) => {
  return playerId == playerIds[turnIndex]
}

export const gameMachine = Machine(
  {
    id: 'game',
    initial: 'not_started',
    states: {
      not_started: {
        on: {
          START: {
            target: 'ongoing',
            cond: 'canStart'
          }
        },
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
    },
    guards: {
      isClosestGuessersTurn,
      isGuessersTurn,
      canStart,
    }
  }
);

export const createGameMachine = (hostId, playerIds, secretNumber) => {
  return gameMachine.withContext({
    secretNumber,
    playerIds,
    closestGuess: null,
    turnIndex: 0,
    winner: null,
    hostId
  })
}

// module.exports = {
//   gameMachine,
//   createGameMachine,
//   getRandomInt
// }