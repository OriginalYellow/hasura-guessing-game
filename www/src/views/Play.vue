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

export default {
  data() {
    return {
      dataLoaded: false,
      hostName: null,
      completionStatus: null,
      players: []
    };
  },

  computed: {
    ...mapState(["userId"]),

    computedPlayers() {
      return this.players.map(({ user }) => ({
        userId: user.id,
        userName: user.name
      }));
    },

    playerNames() {
      return this.computedPlayers.map(x => x.userName);
    }
  },

  filters: {
    snakeToNormalCase: function(str) {
      return str.replace("_", " ");
    }
  },

  mounted() {
    // MIKE: you need to handle possible exceptions (like someone navigating
    // here without a query string)
    this.$apollo
      .mutate({
        mutation: gameSessionByPk,
        variables: {
          id: this.$route.query.id
        }
      })
      .then(
        ({
          data: {
            game_session_by_pk: {
              host: { name },
              completion_status,
              players
            }
          }
        }) => {
          // update data
          this.dataLoaded = true;
          this.hostName = name;
          this.completionStatus = completion_status;
          // MIKE: you could eagarly add new players here
          this.players = players;

          // add player to game if they are not already in
          if (!~this.computedPlayers.findIndex(x => x.userId == this.userId)) {
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
                    insert_game_session_user_one: {
                      game_session: { players }
                    }
                  }
                }) => {
                  this.players = players;
                }
              );
          }
        }
      );
  }
};
</script>