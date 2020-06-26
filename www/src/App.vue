<template>
  <v-app>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title>The Guessing Game</v-toolbar-title>

      <v-spacer />

      <v-btn
        v-show="!isLoggedIn"

        color="blue"
        dark
        depressed
      >
        sign up
      </v-btn>

      <v-btn
        v-show="isLoggedIn"
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
export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
};
</script>
