import * as R from 'ramda';
import * as L from 'partial.lenses';

export const Model = {
  data: 'data',
};

export const Data = {
  gameSessionByPk: 'game_session_by_pk',
};

export const GameSessionByPk = {
  host: ['host'],
  completionStatus: ['completion_status'],
  players: ['players'],
  turnIndex: ['turn_index'],
  winner: ['winner'],
  closestGuesser: ['closest_guesser'],
  id: ['id'],
  secretNumber: ['secretNumber'],
  winnerId: ['winner_id'],
  closestGuess: ['closest_guess'],
  closestGuesserId: ['closest_guesser_id'],
  hostId: ['host_id'],
  gameEvents: ['game_events'],
};

export const Host = {
  name: ['name'],
  id: ['id'],
};

export const Winner = {
  name: ['name'],
};

export const ClosestGuesser = {
  name: ['name'],
};

export const Player = {
  user: ['user'],
  userId: ['user_id'],
};

export const User = {
  name: ['name'],
  id: ['id'],
};

export const GameEvent = {
  eventType: ['event_type'],
  payload: ['payload'],
  id: ['id']
}

Model.playerById = (id) => [
  Model.data,
  Data.gameSessionByPk,
  GameSessionByPk.players,
  L.find(L.get([
    Player.userId,
    R.equals(id),
  ])),
];

export const Lens = {
  gameSessionByPk: [Model.data, Data.gameSessionByPk],
}

Lens.players = [Lens.gameSessionByPk, GameSessionByPk.players]
Lens.gameEvents = [Lens.gameSessionByPk, GameSessionByPk.gameEvents]
Lens.gameEvent = [Lens.gameSessionByPk, GameSessionByPk.gameEvents, L.elems]

export const Get = {
  gameEvents: L.get(Lens.gameEvents),
  secretNumber: L.get([Lens.gameSessionByPk, GameSessionByPk.secretNumber]),
  hostId: L.get([Lens.gameSessionByPk, GameSessionByPk.hostId]),
  playerIds: L.collect([Lens.players, L.elems, Player.userId]),
}

const testData = {
  data: {
    game_session_by_pk: {
      players: [Array],
      secret_number: null,
      winner_id: null,
      id: 65,
      completion_status: 'not_started',
      closest_guess: null,
      closest_guesser_id: null,
      turn_index: 0,
      host_id: 57,
      game_events: []
    }
  }
}
