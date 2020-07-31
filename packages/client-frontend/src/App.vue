<template>
  <v-app>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title :style="{'line-height': .5}">
        <span
          v-show="loggedIn"
          class="text-caption grey--text text--darken-1"
        >signed in as <br> <span class="text-subtitle-2 font-italic">{{ userName }}</span></span>
      </v-toolbar-title>

      <v-spacer v-show="loggedIn || $vuetify.breakpoint.smAndUp" />

      <v-toolbar-title v-ripple="{center: false, class: `purple--text`} ">
        <router-link
          tag="span"
          to="/"
          :class="{'text-subtitle-2': $vuetify.breakpoint.xs, 'ml-16 pl-14': $vuetify.breakpoint.smAndUp, 'ml-16 pl-16': $vuetify.breakpoint.smAndUp && !loggedIn}"
          :style="toolbarTitleStyle"
        >The Guessing Game</router-link>
      </v-toolbar-title>

      <v-spacer v-show="$vuetify.breakpoint.smAndUp || !loggedIn" />

      <v-toolbar-items>
        <v-btn
          v-show="$vuetify.breakpoint.smAndUp"
          to="/"
          color="blue"
          dark
          text
        >
          how to play
        </v-btn>

        <v-btn
          v-show="!loggedIn"
          @click="signup"
          color="green darken-2"
          dark
          text
        >
          sign up
        </v-btn>

        <v-btn
          v-show="loggedIn && $vuetify.breakpoint.smAndUp"
          @click="newGame"
          color="green darken-2"
          dark
          depressed
          text
        >
          new game
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-main class="pb-16">
      <v-fade-transition mode="out-in">
        <router-view />
      </v-fade-transition>
    </v-main>

    <v-btn
      to="/"
      v-show="$vuetify.breakpoint.xs"
      absolute
      dark
      fab
      fixed
      bottom
      right
      large
      color="blue"
      :style="{bottom: '16px'}"
    >
      <v-icon>mdi-help</v-icon>
    </v-btn>

    <v-btn
      @click="newGame"
      v-show="loggedIn && $vuetify.breakpoint.xs"
      absolute
      dark
      fab
      fixed
      bottom
      right
      large
      :outlined="$route.name !== 'Home'"
      :color="$route.name !== 'Home' ? 'green darken-2' : 'green'"
      :style="{bottom: '16px', right: '94px'}"
    >
      new<br>game
    </v-btn>
  </v-app>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      toolbarTitleStyle: { cursor: "pointer" }
    };
  },

  computed: {
    ...mapState(["loggedIn", "userName"])
  },

  methods: {
    ...mapActions(["signup", "newGame"])
  }
};
</script>
