<template>
  <v-container>
    <v-row justify="center">
      <!-- view title -->
      <v-col cols="12">
        <p class="text-center text-h2">Play View</p>
      </v-col>

      <v-col
        v-if="dataLoaded"
        cols="12"
      >
        <!-- game session details -->
        <p>
          <!-- host display -->
          <span class="font-weight-bold">Host: </span>
          {{ gameSession.hostName }}
          <br>

          <!-- completion status display -->
          <span class="font-weight-bold">Game Status: </span>
          {{ computedGameService.completionStatus | snakeToNormalCase}}
          <br>

          <!-- players display -->
          <span class="font-weight-bold">Players: </span>
          <span
            v-for="(player, i) in gameSession.players"
            :key="player.userId"
            :class="gameSession.players[computedGameService.turnIndex].userId == player.userId ? 'text-decoration-underline' : ''"
          >{{ player.userName }}{{ ((i + 1) == gameSession.players.length) ? '' : ', ' }}</span>
          <br>

          <!-- closest guess display -->
          <span v-if="computedGameService.closestGuess">
            <span class="font-weight-bold">Closest Guesser: </span>
            {{ gameSession.players.find(x => x.userId == computedGameService.closestGuesserId).userName }}
            <br>
            <span class="font-weight-bold">Closest Guess Amount: </span>
            {{ computedGameService.closestGuess }}
            <br>
          </span>

          <!-- winner display -->
          <span v-if="computedGameService.completionStatus == 'completed'">
            <span class="font-weight-bold">Winner: </span>
            {{ gameSession.players.find(x => x.userId == computedGameService.winnerId).userName }}
            <!-- {{ computedGameService.winnerId }} -->
          </span>
        </p>

        <!-- start game button -->
        <p>
          <v-btn
            :disabled="!computedGameService.nextEvents.includes(eventTypes.START)"
            @click="insertGameEventOne(eventTypes.START, { playerId: userId })"
            color="green"
          >
            start game
          </v-btn>
        </p>

        <!-- guess input -->
        <v-row>
          <v-col cols="4">
            <v-text-field
              :disabled="!computedGameService.nextEvents.includes(eventTypes.GUESS)"
              outlined
              v-model="guessValue"
            />

            <v-btn
              :disabled="!computedGameService.nextEvents.includes(eventTypes.GUESS)"
              @click="insertGameEventOne(eventTypes.GUESS, { value: guessValue, playerId: userId })"
              color="primary"
            >
              make guess
            </v-btn>
          </v-col>
        </v-row>

        <v-snackbar v-model="snackbar">
          {{ fullNotificationText | sentenceCase }}

          <template v-slot:action="{ attrs }">
            <v-btn
              color="red"
              text
              v-bind="attrs"
              @click="snackbar = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </v-col>

      <!-- not signed in alert -->
      <v-col
        v-else
        cols="6"
      >
        <v-alert
          type="warning"
          prominent
          border="left"
        >
          You must first sign up before you can join this game.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import * as R from "ramda";
import * as RA from "ramda-adjunct";
import * as L from "partial.lenses";
import gameSessionByPk from "@/gql/gameSessionByPk/minimumGameState/index.gql";
import gameSessionByPkSubscription from "@/gql/gameSessionByPk/minimumGameState/subscription.gql";
import insertGameSessionUserOne from "@/gql/insertGameSessionUserOne.gql";
import insertGameEventOne from "@/gql/insertGameEventOne/returnEvent.gql";
import { interpret } from "xstate";
import {
  createGameMachine,
  notifications,
  eventTypes
} from "@hasura-guessing-game/game-machine";
import { models as M } from "@hasura-guessing-game/lenses";
import transforms from "./transform";

// MIKE: you need to handle more possible exceptions (like someone navigating
// here without a query string)

const optimisticEventId = -1;

const fullNotifcationTexts = {
  [notifications.TOO_FEW_PLAYERS]:
    "there are not enough players for you to start the game - there needs to be at least 2",
  [notifications.GUESS_WRONG_TURN]:
    "you cannot guess because it's not your turn",
  [notifications.PLAYER_WON]: "a player has won the game!"
};

export default {
  data() {
    return {
      gameSession: null,
      gameService: null,
      guessValue: null,
      snackbar: false,
      eventTypes
    };
  },

  apollo: {
    gameSession() {
      return {
        query: gameSessionByPk,
        variables() {
          return {
            id: this.$route.query.id
          };
        },
        // NOTE: if there is no data payload in the response, update is passed
        // an empty object (for some dumb reason)
        // MIKE: the above might be due to a defect
        update: data =>
          RA.isNilOrEmpty(data) ? null : transforms.gameSessionByPk.props(data),
        subscribeToMore: {
          document: gameSessionByPkSubscription,
          variables() {
            return { id: this.$route.query.id };
          },
          updateQuery: (
            _,
            { subscriptionData: { data: subscriptionResult } }
          ) => subscriptionResult
        },
        result(response) {
          if (response.loading) {
            return;
          }

          // add the current user to the game as a player if they are not
          // already
          if (
            !L.get(M.gameSessionByPk.Lens.playerById(this.userId), response)
          ) {
            this.$apollo.mutate({
              mutation: insertGameSessionUserOne,
              variables: { gameSessionId: this.$route.query.id }
            });
          }
        }
      };
    }
  },

  computed: {
    ...mapState(["userId"]),

    computedGameService() {
      return transforms.gameService.gameState(this.gameService);
    },

    dataLoaded() {
      return !!this.gameSession && !!this.gameService;
    },

    fullNotificationText() {
      if (this.dataLoaded && this.computedGameService.notification) {
        return (
          fullNotifcationTexts[this.computedGameService.notification] ||
          // fallback to the original text if no "full text" exists
          this.computedGameService.notification
        );
      }

      return "";
    }
  },

  watch: {
    gameSession(newGameSession, oldGameSession) {
      if (!newGameSession) {
        return;
      }

      // return early if there are no new game events or if the new game session
      // doesn't have a new id
      if (
        !!oldGameSession &&
        newGameSession.gameEvents.length == oldGameSession.gameEvents.length &&
        newGameSession.id !== oldGameSession.id
      ) {
        return;
      }

      // create game machine
      const notify = context => {
        switch (context.notification) {
          case notifications.TOO_FEW_PLAYERS:
          case notifications.GUESS_WRONG_TURN:
          case notifications.NON_HOST_CANT_START:
            // only notify if the last event was sent by this user
            if (R.last(newGameSession.gameEvents).playerId == this.userId) {
              this.snackbar = true;
            }
            break;
          default:
            this.snackbar = true;
            break;
        }
      };

      const playerIds = newGameSession.players.map(x => x.userId);

      const gameMachine = createGameMachine(
        newGameSession.hostId,
        playerIds,
        newGameSession.secretNumber,
        notify
      );

      // start game service
      const gameService = interpret(gameMachine).start();

      // playback events, and turn on notifications before sending the last one
      if (newGameSession.gameEvents.length > 0) {
        if (newGameSession.gameEvents.length == 1) {
          gameService.send("SHOW_NOTIFICATIONS");
          gameService.send(newGameSession.gameEvents);
        } else {
          gameService.send(R.init(newGameSession.gameEvents));
          gameService.send("SHOW_NOTIFICATIONS");
          gameService.send(R.last(newGameSession.gameEvents));
        }
      }

      // set game service in data
      this.gameService = gameService;
    }
  },

  methods: {
    insertGameEventOne(eventType, payload) {
      this.$apollo.mutate({
        mutation: insertGameEventOne,
        variables: {
          eventType,
          gameSessionId: this.gameSession.id,
          payload
        },
        update: (store, { data: { insert_game_event_one: newEvent } }) => {
          const gameSessionByPkCached = store.readQuery({
            query: gameSessionByPk,
            variables: {
              id: this.$route.query.id
            }
          });

          store.writeQuery({
            query: gameSessionByPk,
            data: transforms.gameSessionByPk.appendEvent(
              newEvent,
              gameSessionByPkCached
            )
          });
        },
        optimisticResponse: {
          insert_game_event_one: {
            id: optimisticEventId,
            event_type: eventType,
            game_session_id: this.gameSession.id,
            user_id: this.userId,
            payload,
            __typename: "game_event"
          }
        }
      });
    }
  },

  filters: {
    snakeToNormalCase(str) {
      return str.replace("_", " ");
    },

    sentenceCase: R.pipe(
      R.juxt([R.pipe(R.head, R.toUpper), R.tail]),
      R.join("")
    )
  }
};
// NOTE: "If you provide an optimisticResponse option to the mutation then the
// update function will be run twice. Once immediately after you call
// client.mutate with the data from optimisticResponse. After the mutation
// successfully executes against the server the changes made in the first call
// to update will be rolled back and update will be called with the actual data
// returned by the mutation and not just the optimistic response."
</script>
