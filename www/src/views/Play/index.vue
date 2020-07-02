<template>
  <v-container>
    <v-row justify="center">
      <!-- view title -->
      <v-col cols="12">
        <p class="text-center text-h2">Play View</p>
      </v-col>

      <!-- game session details -->
      <v-col
        v-if="dataLoaded"
        cols="12"
      >
        <p>
          <!-- host display -->
          <span class="font-weight-bold">Host: </span>
          {{ gameSession.hostName }}
          <br>

          <!-- completion status display -->
          <span class="font-weight-bold">Game Status: </span>
          {{ gameSession.completionStatus | snakeToNormalCase}}
          <br>

          <!-- players display -->
          <span class="font-weight-bold">Players: </span>
          <span
            v-for="(playerName, i) in playerNames"
            :key="playerName"
          >{{ playerName }}{{ ((i + 1) == playerNames.length) ? '' : ', ' }}</span>
          <br>

          <!-- winner display -->
          <span
            class="font-weight-bold"
            v-if="gameSession.completionStatus == 'completed'"
          >Winner: </span>
          {{ gameSession.winnerName }}
        </p>

        <p>
          <v-btn
            v-if="gameSession.hostId == userId"
            @click="sendGameEvent('START', { playerId: userId })"
            :disabled="gameSession.completionStatus !== 'not_started'"
            color="green"
          >
            start game
          </v-btn>
        </p>

        <v-row v-if="gameSession.completionStatus == 'ongoing'">
          <v-col cols="4">
            <v-text-field
              outlined
              v-model="guessValue"
            />

            <v-btn
              @click="sendGameEvent('GUESS', { value: guessValue, playerId: userId })"
              :disabled="!isPlayersTurn"
              color="primary"
            >
              make guess
            </v-btn>
          </v-col>
        </v-row>
      </v-col>

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
import * as RA from "ramda-adjunct";
import * as L from "partial.lenses";
import gameSessionByPk from "@/gql/gameSessionByPk.gql";
import gameSessionByPkSubscription from "@/gql/gameSessionByPkSubscription.gql";
import insertGameSessionUserOne from "@/gql/insertGameSessionUserOne.gql";
import sendGameEvent from "@/gql/sendGameEvent.gql";
import { Transform, Lens } from "@/lenses/gameSessionByPk.js";
const { Data, Model, GameSessionByPk } = Lens;

// MIKE: you need to handle possible exceptions (like someone navigating
// here without a query string)

export default {
  data() {
    return {
      gameSession: null,
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
        update: data => (RA.isNilOrEmpty(data) ? null : Transform.data(data)),
        subscribeToMore: {
          document: gameSessionByPkSubscription,
          variables() {
            return { id: this.$route.query.id };
          },
          updateQuery: (_, { subscriptionData: { game_session_by_pk } }) =>
            game_session_by_pk
        },
        result(response) {
          if (response.loading) {
            return;
          }

          if (!L.get(Model.playerById(this.userId), response)) {
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

    isPlayersTurn() {
      return (
        this.gameSession.completionStatus == "ongoing" &&
        this.gameSession.players[this.gameSession.turnIndex].userId ==
          this.userId
      );
    },

    dataLoaded() {
      return !!this.gameSession;
    },

    playerNames() {
      if (this.dataLoaded) {
        return this.gameSession.players.map(x => x.userName);
      }

      return [];
    }
  },

  methods: {
    sendGameEvent(eventType, payload) {
      this.$apollo.mutate({
        mutation: sendGameEvent,
        variables: {
          eventType,
          gameSessionId: this.gameSession.id,
          payload
        }
      });
    }
  },

  filters: {
    snakeToNormalCase: function(str) {
      return str.replace("_", " ");
    }
  }
};
</script>