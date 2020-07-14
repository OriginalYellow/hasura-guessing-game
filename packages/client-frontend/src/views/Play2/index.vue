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
      localGameState: null,
      localGameContext: null,
      transformedLocalGameState: null,
      // gameService: null,
      guessValue: null
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
    gameSession(newSession, oldSession) {
      if (!!newSession) {
        const gameMachine = createGameMachine(
          this.gameSession.hostId,
          this.gameSession.players.map(x => x.userId),
          this.gameSession.secretNumber
        );

        const gameService = interpret(gameMachine)
          .onTransition((state, eventObj) => {
            console.log("im transitioning!");
            console.log("eventObj:");
            console.log(eventObj);
            this.gameState = state;
            this.gameContext = state.context;
          })
          .start();

        if (newSession.gameEvents.length > 0) {
          gameService.send(newSession.gameEvents);
        }

        this.transformedLocalGameState = transforms.gameService.model(
          gameService
        );
      }
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
    }
  }
};
// NOTE: "If you provide an optimisticResponse option to the mutation then the
// update function will be run twice. Once immediately after you call
// client.mutate with the data from optimisticResponse. After the mutation
// successfully executes against the server the changes made in the first call
// to update will be rolled back and update will be called with the actual data
// returned by the mutation and not just the optimistic response."
</script>
