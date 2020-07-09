import * as R from 'ramda';
import * as L from 'partial.lenses';

export const Model = {
  data: ['data'],
};

export const Data = {
  gameSessionByPk: ['game_session_by_pk'],
};

export const GameSessionByPk = {
  host: ['host'],
  completionStatus: ['completion_status'],
  players: ['players'],
  turnIndex: ['turn_index'],
  winner: ['winner'],
  closestGuesser: ['closest_guesser'],
  id: ['id'],
  secretNumber: ['secret_number'],
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

export const Lens = {
  gameSessionByPk: [Model.data, Data.gameSessionByPk],
}

Lens.players = [Lens.gameSessionByPk, GameSessionByPk.players]
Lens.gameEvents = [Lens.gameSessionByPk, GameSessionByPk.gameEvents]
Lens.gameEvent = [Lens.gameSessionByPk, GameSessionByPk.gameEvents, L.elems]

Lens.playerById = (id) => [
  Lens.players,
  L.find(L.get([
    Player.userId,
    R.equals(id),
  ])),
]

Data.Lens = {
  players: [Data.gameSessionByPk, GameSessionByPk.players],
  gameEvents: [Data.gameSessionByPk, GameSessionByPk.gameEvents],
  gameEvent: [Data.gameSessionByPk, GameSessionByPk.gameEvents, L.elems],
}

Data.Lens.gameEventById = (id) => [
  Data.Lens.gameEvents,
  L.find(L.get([
    GameEvent.id,
    R.equals(id)
  ]))
]

export const Get = {
  gameEvents: L.get(Lens.gameEvents),
  secretNumber: L.get([Lens.gameSessionByPk, GameSessionByPk.secretNumber]),
  hostId: L.get([Lens.gameSessionByPk, GameSessionByPk.hostId]),
  playerIds: L.collect([Lens.players, L.elems, Player.userId]),
}
