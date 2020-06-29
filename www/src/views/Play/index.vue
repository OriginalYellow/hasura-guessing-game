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
        </p>
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
import { Transform, Lens } from "@/lenses/gameSessionByPk.js";
const { Data, Model, GameSessionByPk } = Lens;

// MIKE: you need to handle possible exceptions (like someone navigating
// here without a query string)
export default {
  data() {
    return {
      gameSession: null,
      debugId: 19
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
        update: data => (RA.isNilOrEmpty(data) ? null : Transform.data(data)),
        subscribeToMore: {
          document: gameSessionByPkSubscription,
          variables() {
            return { id: this.$route.query.id };
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            return subscriptionData.game_session_by_pk;
          }
        },
        result(response) {
          if (!L.get(Model.playerById(this.userId), response)) {
            this.$apollo
              .mutate({
                mutation: insertGameSessionUserOne,
                variables: { gameSessionId: this.$route.query.id }
              })
              .then(
                ({
                  data: {
                    insert_game_session_user_one: { game_session }
                  }
                }) => {
                  this.gameSession = game_session;
                }
              );
          }
        }
      };
    }
  },

  computed: {
    ...mapState(["userId"]),

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

  filters: {
    snakeToNormalCase: function(str) {
      return str.replace("_", " ");
    }
  }
};
</script>