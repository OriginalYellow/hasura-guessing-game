<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <p class="text-center text-h2">Play View</p>
        <p v-show="dataLoaded">
          <span class="font-weight-bold">Host: </span>
          {{ hostName }}
          <br>
          <span class="font-weight-bold">Game Status: </span>
          {{ completionStatus | snakeToNormalCase}}
        </p>
      </v-col>
      <v-col cols="12">

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gameSessionByPk from "../gql/gameSessionByPk.gql";

export default {
  data() {
    return {
      dataLoaded: false,
      hostName: null,
      completionStatus: null
    };
  },

  filters: {
    snakeToNormalCase: function(str) {
      return str.replace("_", " ");
    }
  },

  mounted() {
    // MIKE: you need to handle possible exceptions (like someone navigating
    // here without a querystring)
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
              completion_status
            }
          }
        }) => {
          this.dataLoaded = true;
          this.hostName = name;
          this.completionStatus = completion_status;
        }
      );
  }
};
</script>