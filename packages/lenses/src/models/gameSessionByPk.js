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
  closestGuess: ['closest_guess'],
  id: ['id'],
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

Model.playerById = (id) => [
  Model.data,
  Data.gameSessionByPk,
  GameSessionByPk.players,
  L.find(L.get([
    Player.userId,
    R.equals(id),
  ])),
];
