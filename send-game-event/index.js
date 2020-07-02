const jsonFormat = require('json-format')
const fetch = require('node-fetch')
const { json, createError, send } = require('micro')
const { interpret } = require('xstate')
const { GameMachine, createGameMachine, getRandomInt } = require('./GameMachine')

const HASURA_QUERY = `
  query gameSessionByPk($id: Int!) {
    game_session_by_pk(id: $id) {
      players(order_by: {created_at: asc}) {
        user_id
      }
      secret_number
      winner_id
      id
      completion_status
      closest_guess
      closest_guesser_id
      turn_index
      host_id
      game_events(order_by: {created_at: asc}) {
        event_type
        payload
        id
      }
    }
  }
`

const HASURA_OPERATION = `
  mutation sendGameEvent($closest_guess: Int, $closest_guesser_id: Int, $completion_status: completion_status_enum, $secret_number: Int, $turn_index: Int, $winner_id: Int, $pk_columns: game_session_pk_columns_input!, $event_type: String, $payload: json, $game_session_id: Int) {
    update_game_session_by_pk(_set: {closest_guess: $closest_guess, closest_guesser_id: $closest_guesser_id, completion_status: $completion_status, secret_number: $secret_number, turn_index: $turn_index, winner_id: $winner_id}, pk_columns: $pk_columns) {
      closest_guess
      closest_guesser_id
      completion_status
      id
      players(order_by: {created_at: asc}) {
        user_id
      }
      secret_number
      turn_index
      winner_id
    }
    insert_game_event_one(object: {game_session_id: $game_session_id, event_type: $event_type, payload: $payload}) {
      id
    }
  }
`;

// execute the parent operation in Hasura
const executeOperation = async (variables) => {
  const fetchResponse = await fetch(
    process.env.HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql',
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      }),
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || 'HVVTa3PSDocVJvbliFlu'
      }
    }
  );

  const data = await fetchResponse.json();
  return data;
};

// execute the parent operation in Hasura
const executeQuery = async (variables) => {
  const fetchResponse = await fetch(
    process.env.HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql',
    {
      method: 'POST',
      body: JSON.stringify({
        query: HASURA_QUERY,
        variables
      }),
      headers: {
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || 'HVVTa3PSDocVJvbliFlu'
      }
    }
  );

  const data = await fetchResponse.json();
  return data;
};

// Request Handler
const handler = async (req, res) => {
  // get request data
  let reqData = null
  try {
    reqData = await json(req);
  } catch (e) {
    // MIKE: this will throw silently and return an empty object
    reqData = {}
  }

  const userId = reqData.session_variables['x-hasura-user-id']
  const { gameSessionId, eventType, payload } = reqData.input

  console.log('reqData.input:')
  console.log(reqData.input)

  // run some business logic
  const queryData = await executeQuery({ id: gameSessionId })

  console.log('queryData:')
  console.log(queryData)

  // create game service and send it the event
  let secretNumber = null

  if (queryData.data.game_session_by_pk.game_events.length > 0) {
    secretNumber = queryData.data.game_session_by_pk.secret_number
  } else {
    secretNumber = getRandomInt(-100, 100)
  }

  const gameMachine = createGameMachine(
    queryData.data.game_session_by_pk.host_id,
    queryData.data.game_session_by_pk.players.map(x => x.user_id),
    secretNumber,
  )

  const gameService = interpret(gameMachine)
    .onTransition((state) => {
      if (state.changed) {
        console.log(state.value)
        console.log(state.context)
      }
    })
    .start();

  // replay events on gameService to get most recent state
  if (queryData.data.game_session_by_pk.game_events.length > 0) {
    // MIKE: you should probably pass the events to send as an array instead
    queryData.data.game_session_by_pk.game_events.forEach(event => {
      gameService.send({ type: event.event_type, ...event.payload })
    })
  }

  // send input event
  gameService.send({ type: eventType, ...payload })

  console.log('event:')
  console.log({ type: eventType, ...payload })
  console.log('context:')
  console.log(gameService.state.context)
  console.log('state:')
  console.log(gameService.state.value)

  // execute operation
  const data = await executeOperation({
    secret_number: gameService.state.context.secretNumber,
    turn_index: gameService.state.context.turnIndex,
    winner_id: gameService.state.context.winner,
    closest_guess: gameService.state.context.closestGuess ? gameService.state.context.closestGuess.value : null,
    closest_guesser_id: gameService.state.context.closestGuess ? gameService.state.context.closestGuess.playerId : null,
    completion_status: gameService.state.value,
    pk_columns: { id: gameSessionId },
    event_type: eventType,
    payload,
    game_session_id: gameSessionId,
  })

  console.log('data:')
  console.log(data)

  send(
    res,
    '200',
    {
      id: data.data.update_game_session_by_pk.id,
    })
};

module.exports = handler;