import { Machine, interpret, assign, actions } from 'xstate'
const { log } = actions;

// MIKE: you should use something like state.nextEvents to determine what
// buttons should be enabled on the client
// (https://xstate.js.org/docs/guides/states.html#state-nextevents)

const TOO_FEW_PLAYERS = 'not enough players to start'
const GUESS_WRONG_TURN = 'guess on wrong turn'
const PLAYER_WON = 'a player has won the game'

export const notifications = {
  TOO_FEW_PLAYERS,
  GUESS_WRONG_TURN,
  PLAYER_WON,
}

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

const setNotification = notification => assign({ notification })

const showNotifications = assign({ showNotifications: true })

const isClosestGuessersTurn = ({ closestGuess, turnIndex, playerIds }) => {
  if (!closestGuess) {
    return false
  }

  return closestGuess.playerId == playerIds[turnIndex]
}

const isGuessersTurn = ({ turnIndex, playerIds }, { playerId }) => {
  return playerId == playerIds[turnIndex]
}

const gameMachine = {
  id: 'game',
  initial: 'not_started',
  states: {
    not_started: {
      on: {
        START: [
          { target: 'ongoing', cond: 'canStart' },
          { actions: [setNotification(TOO_FEW_PLAYERS), 'notify'] },
        ]
      },
    },
    ongoing: {
      on: {
        '': [
          { target: 'completed', cond: 'isClosestGuessersTurn' }
        ],
        GUESS: [
          {
            cond: 'isGuessersTurn',
            actions: ['updateClosestGuess', 'incrementTurnIndex']
          },
          { actions: [setNotification(GUESS_WRONG_TURN), 'notify'] },
        ]
      }
    },
    completed: {
      entry: ['setWinner', setNotification(PLAYER_WON), 'notify'],
      type: 'final'
    }
  },
  on: {
    SHOW_NOTIFICATIONS: { actions: 'showNotifications' }
  }
}

export const createGameMachine = (
  hostId,
  playerIds,
  secretNumber,
  notify = (() => null)
) => {
  return Machine(
    gameMachine,
    {
      actions: {
        updateClosestGuess,
        incrementTurnIndex,
        setWinner,
        showNotifications,
        notify: (context, event) => context.showNotifications && notify(context, event),
      },
      guards: {
        isClosestGuessersTurn,
        isGuessersTurn,
        canStart,
      }
    }
  ).withContext({
    showNotifications: false,
    notification: null,
    secretNumber,
    playerIds,
    closestGuess: null,
    turnIndex: 0,
    winner: null,
    hostId
  })
}
