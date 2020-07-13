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

Data.Lens = {
  players: [Data.gameSessionByPk, GameSessionByPk.players],
  gameEvents: [Data.gameSessionByPk, GameSessionByPk.gameEvents],
  id: [Data.gameSessionByPk, GameSessionByPk.id],
  closestGuess: [Data.gameSessionByPk, GameSessionByPk.closestGuess],
  completionStatus: [Data.gameSessionByPk, GameSessionByPk.completionStatus]
}

Data.Lens.player = [Data.Lens.players, L.elems]
Data.Lens.playerUser = [Data.Lens.player, Player.user]
Data.Lens.gameEvent = [Data.Lens.gameEvents, L.elems]
Data.Lens.host = [Data.gameSessionByPk, GameSessionByPk.host]
Data.Lens.hostName = [Data.Lens.host, Host.name]
Data.Lens.hostId = [Data.Lens.host, Host.id]
Data.Lens.closestGuesser = [Data.gameSessionByPk, GameSessionByPk.closestGuesser]
Data.Lens.closestGuesserName = [Data.Lens.closestGuesser, ClosestGuesser.name]
Data.Lens.turnIndex = [Data.gameSessionByPk, GameSessionByPk.turnIndex]
Data.Lens.winner = [Data.gameSessionByPk, GameSessionByPk.winner]
Data.Lens.winnerName = [Data.Lens.winner, Winner.name]
Data.Lens.secretNumber = [Data.gameSessionByPk, GameSessionByPk.secretNumber]

Data.Lens.gameEventById = (id) => [
  Data.Lens.gameEvents,
  L.find(L.get([
    GameEvent.id,
    R.equals(id)
  ]))
]

export const Lens = {
  gameSessionByPk: [Model.data, Data.gameSessionByPk],
  id: [Model.data, Data.Lens.id],
  closestGuess: [Model.data, Data.Lens.closestGuess],
  completionStatus: [Model.data, Data.Lens.completionStatus],
  players: [Model.data, Data.Lens.players],
  player: [Model.data, Data.Lens.player],
  playerUser: [Model.data, Data.Lens.playerUser],
  gameEvents: [Model.data, Data.Lens.gameEvents],
  gameEvent: [Model.data, Data.Lens.gameEvent],
  host: [Model.data, Data.Lens.host],
  hostName: [Model.data, Data.Lens.hostName],
  hostId: [Model.data, Data.Lens.hostId],
  closestGuesser: [Model.data, Data.Lens.closestGuesser],
  closestGuesserName: [Model.data, Data.Lens.closestGuesserName],
  turnIndex: [Model.data, Data.Lens.turnIndex],
  winner: [Model.data, Data.Lens.winner],
  winnerName: [Model.data, Data.Lens.winnerName],
  secretNumber: [Model.data, Data.Lens.secretNumber],
}

Lens.playerById = (id) => [
  Lens.players,
  L.find(L.get([
    Player.userId,
    R.equals(id),
  ])),
]

export const Get = {
  gameEvents: L.get(Lens.gameEvents),
  secretNumber: L.get([Lens.gameSessionByPk, GameSessionByPk.secretNumber]),
  hostId: L.get([Lens.gameSessionByPk, GameSessionByPk.hostId]),
  playerIds: L.collect([Lens.players, L.elems, Player.userId]),
}
