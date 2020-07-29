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
          {{ gameState.completionStatus | snakeToNormalCase}}
          <br>

          <!-- players display -->
          <span class="font-weight-bold">Players: </span>
          <span
            v-for="(player, i) in gameSession.players"
            :key="player.userId"
            :class="gameSession.players[gameState.turnIndex].userId == player.userId ? 'text-decoration-underline' : ''"
          >{{ player.userName }}{{ ((i + 1) == gameSession.players.length) ? '' : ', ' }}</span>
          <br>

          <!-- closest guess display -->
          <span v-if="gameState.closestGuess">
            <span class="font-weight-bold">Closest Guesser ID: </span>
            {{ gameState.closestGuesserId }}
            <br>
            <span class="font-weight-bold">Closest Guess Amount: </span>
            {{ gameState.closestGuess }}
            <br>
          </span>

          <!-- winner display -->
          <span v-if="gameState.completionStatus == 'completed'">
            <span class="font-weight-bold">Winner ID: </span>
            {{ gameState.winnerId }}
          </span>
        </p>

        <!-- start game button -->
        <p>
          <v-btn
            v-if="gameSession.hostId == userId"
            @click="insertGameEventOne('START', { playerId: userId })"
            color="green"
          >
            start game
          </v-btn>
        </p>

        <!-- guess input -->
        <v-row v-if="gameState.completionStatus == 'ongoing'">
          <v-col cols="4">
            <v-text-field
              outlined
              v-model="guessValue"
            />

            <!-- :disabled="!isPlayersTurn" -->
            <v-btn
              @click="insertGameEventOne('GUESS', { value: guessValue, playerId: userId })"
              color="primary"
            >
              make guess
            </v-btn>
          </v-col>
        </v-row>

        <v-snackbar v-model="snackbar">
          {{ (gameState.message ? gameState.message : '') | sentenceCase }}

          <template v-slot:action="{ attrs }">
            <v-btn
              color="pink"
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
import { createGameMachine } from "@hasura-guessing-game/game-machine";
import { models as M } from "@hasura-guessing-game/lenses";
import transforms from "./transform";

// MIKE: you need to handle more possible exceptions (like someone navigating
// here without a query string)

const optimisticEventId = -1;

export default {
  data() {
    return {
      gameSession: null,
      gameState: null,
      guessValue: null,
      snackbar: false,
      eventCount: 0,
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
          ) => {
            return subscriptionResult;
          }
        },
        result(response) {
          if (response.loading) {
            return;
          }

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

    dataLoaded() {
      return !!this.gameSession;
    }
  },

  watch: {
    gameSession(gameSession) {
      if (!gameSession) {
        return;
      }

      if (this.eventCount > this.gameSession.gameEvents.length) {
        return;
      }

      this.eventCount = this.gameSession.gameEvents.length;

      const gameMachine = createGameMachine(
        this.gameSession.hostId,
        this.gameSession.players.map(x => x.userId),
        this.gameSession.secretNumber,
        context =>
          context.showNotifications &&
          R.last(gameSession.gameEvents).playerId == this.userId &&
          (this.snackbar = true)
      );

      const gameService = interpret(gameMachine).start();

      if (gameSession.gameEvents.length > 0) {
        if ((gameSession.gameEvents.length == 1)) {
          gameService.send("SHOW_NOTIFICATIONS");
          gameService.send(gameSession.gameEvents);
        } else {
          gameService.send(R.init(gameSession.gameEvents));
          gameService.send("SHOW_NOTIFICATIONS");
          gameService.send(R.last(gameSession.gameEvents));
        }
      }

      this.gameState = transforms.gameService.gameState(gameService);
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
