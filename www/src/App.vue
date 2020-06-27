<template>
  <v-app>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title v-ripple="{center: false, class: `purple--text`} ">
        <router-link
          tag="span"
          to="/"
          class="pa-5"
          :style="toolbarTitleStyle"
        >The Guessing Game</router-link>
      </v-toolbar-title>

      <v-spacer />

      <span
        v-show="loggedIn"
        class="mr-4 text-subtitle-2 font-italic"
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
        @click="newGame"
        color="purple"
        dark
        depressed
      >
        new game
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      toolbarTitleStyle: { cursor: "pointer" }
    }
  },
  
  computed: {
    ...mapState(["loggedIn", "userName"])
  },

  methods: {
    ...mapActions(["signup", "newGame"])
  }
};
</script>
