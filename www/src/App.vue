<template>
  <v-app>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title>The Guessing Game</v-toolbar-title>

      <v-spacer />

      <span
        v-show="loggedIn"
        class="mr-4"
      >signed in as "{{ userName }}"</span>

      <v-btn
        v-show="!loggedIn"
        @click="signup"
        color="blue"
        dark
        depressed
      >
        sign up
      </v-btn>

      <v-btn
        v-show="loggedIn"
        color="purple"
        dark
        depressed
      >
        new game
      </v-btn>
    </v-app-bar>
    <router-view />
  </v-app>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['loggedIn', 'userName'])
  },

  methods: {
    ...mapActions(['signup'])
  }
};
</script>
