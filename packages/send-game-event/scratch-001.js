// MACHINES:
// - Existing machines can be extended using .withConfig()

// EVENTS:
// - A null event is an event that has no type, and occurs immediately once a
//   state is entered. In transitions, it is represented by an empty string ('')
// - By specifying the event type on the type property, many native events, such
//   as DOM events, are compatible and can be used directly with XState

// FINAL STATES:
// - In a compound state, reaching a final child state node (with { type:
//   'final'}) will internally raise a done(...) event for that compound state
//   node (e.g., "done.state.light.crosswalkEast"). Using onDone is equivalent
//   to defining a transition for this event.
// - When every child state node in a parallel state node is done, the parent
//   parallel state node is also done. That is, when every final state node in
//   every child compound node is reached, the done(...) event will be raised
//   for the parallel state node.

// IDENTIFYING STATE NODES:
// - Child state nodes can be targeted relative to their parent by specifying a
//   dot ('.') followed by their key (see
//   https://xstate.js.org/docs/guides/ids.html#relative-targets)

// INTERPRETING MACHINES:
// - If you only want the .onTransition(...) handler(s) to be called when the
//   state changes (that is, when the state.value changes, the state.context
//   changes, or there are new state.actions), use state.changed
// - Actions can be executed manually by calling service.execute(state). This is
//   useful when you want to control when actions are executed

const { interpret } = require('xstate')
const { createGameMachine, getRandomInt } = require('./GameMachine')

const gameMachine = createGameMachine(43, [43, 51], 50)

const gameService = interpret(gameMachine)
  .onTransition((state) => {
    if (state.changed) {
      // console.log(state.value)
      // console.log(state.context)
    }
  })
  .start();

// gameService.state.value // ?
// gameService.state.context // ?

// var nextState = null
// nextState = gameService.send('START')

// const gameService2 = interpret(gameMachine)
//   .onTransition((state) => {
//     if (state.changed) {
//       // console.log(state.value)
//       // console.log(state.context)
//     }
//   })
//   .start(nextState);

// gameService2.send('GUESS', { playerId: 43, value: 23 })

const gameService3 = interpret(gameMachine)
  .onTransition((state) => {
    if (state.changed) {
      console.log(state.value)
      console.log(state.context)
    }
  })
  .start();

gameService3.send([
  { type: 'START', playerId: 43 },
  { type: 'GUESS', value: 24, playerId: 43 },
  { type: 'GUESS', value: 24, playerId: 51 }
])

// gameService3.send({ type: 'START', playerId: 43 }).value // ?
// gameService3.send({ type: 'GUESS', value: 24, playerId: 43 }).context // ?