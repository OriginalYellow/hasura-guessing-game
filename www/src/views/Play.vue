<template>
  <v-container>
    <v-row justify="center">
      <!-- view title -->
      <v-col cols="12">
        <p class="text-center text-h2">Play View</p>
      </v-col>

      <!-- game session details -->
      <v-col
        v-if="game_session_by_pk"
        cols="12"
      >
        <p>
          <!-- host display -->
          <span class="font-weight-bold">Host: </span>
          {{ hostName }}
          <br>

          <!-- completion status display -->
          <span class="font-weight-bold">Game Status: </span>
          {{ completionStatus | snakeToNormalCase}}
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
import gameSessionByPk from "../gql/gameSessionByPk.gql";
import insertGameSessionUserOne from "../gql/insertGameSessionUserOne.gql";
import { mapState } from "vuex";

// MIKE: you need to handle possible exceptions (like someone navigating
// here without a query string)
export default {
  data() {
    return {
      game_session_by_pk: null
    };
  },

  apollo: {
    // MIKE: use the "update" option to format the result instead of doing so
    // inside of a bunch of computed properties like you are doing now. this
    // will also let you rename the result from that ugly snake case ew
    game_session_by_pk() {
      return {
        query: gameSessionByPk,
        variables: {
          id: this.$route.query.id
        },
        result({
          data: {
            game_session_by_pk: { players }
          }
        }) {
          if (!~players.findIndex(x => x.user_id == this.userId)) {
            this.$apollo
              .mutate({
                mutation: insertGameSessionUserOne,
                variables: {
                  gameSessionId: this.$route.query.id
                }
              })
              .then(
                ({
                  data: {
                    insert_game_session_user_one: { game_session }
                  }
                }) => {
                  this.game_session_by_pk = game_session;
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
      return !!this.game_session_by_pk;
    },

    hostName() {
      return this.game_session_by_pk.host.name;
    },

    completionStatus() {
      return this.game_session_by_pk.completion_status;
    },

    players() {
      return this.game_session_by_pk.players.map(({ user }) => ({
        userId: user.id,
        userName: user.name
      }));
    },

    playerNames() {
      return this.players.map(x => x.userName);
    }
  },

  filters: {
    snakeToNormalCase: function(str) {
      return str.replace("_", " ");
    }
  },
};
</script>