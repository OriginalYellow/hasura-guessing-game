import Vue from 'vue';
import Vuex from 'vuex';
import gql from 'graphql-tag';
import { restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client';
import router from '@/router';
import { apolloClient } from '@/main';
import createTempUser from '@/gql/createTempUser.gql'
import insertGameSessionOne from '@/gql/insertGameSessionOne.gql'
import gameSessionByPk from '@/gql/gameSessionByPk/index.gql'

// MIKE: i don't like using snake case for these local storage keys
const previouslyLoggedInKey = 'guessing_game_previously_logged_in'
const tokenKey = 'guessing_game_token'
const userNameKey = 'guessing_game_user_name'
const userIdKey = 'guessing_game_user_id'

// some util functions
const set = property => (state, payload) => (state[property] = payload);
const toggle = property => state => (state[property] = !state[property]);

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loggedIn: false,
    token: null,
    userName: null,
    userId: null
  },

  mutations: {
    setLoggedIn: set('loggedIn'),
    setToken: set('token'),
    setUserId: set('userId'),
    setUserName: set('userName')
  },

  actions: {
    refreshLogin({ dispatch }) {
      if (
        (typeof localStorage != undefined)
        && (localStorage.getItem(previouslyLoggedInKey) == 'true')
      ) {
        const token = localStorage.getItem(tokenKey)
        const userId = parseInt(localStorage.getItem(userIdKey))
        const userName = localStorage.getItem(userNameKey)

        dispatch('login', { token, userId, userName })
      }
    },

    async signup({ commit, dispatch }) {
      // get a token and new user data
      const { data: { createTempUser: { token, name, id } } } = await apolloClient.mutate({
        mutation: createTempUser,
        // MIKE: if you add a form for selecting a temporary username, you can
        // just include the name variable like this:
        // variables: {
        //   name: 'cooluser70'
        // },
      })

      if (typeof localStorage != 'undefined') {
        localStorage.setItem(previouslyLoggedInKey, 'true')

        // store user data in local storage (i know this is bad but i dont think
        // it's too bad in this case)
        localStorage.setItem(tokenKey, token)
        localStorage.setItem(userIdKey, id)
        localStorage.setItem(userNameKey, name)
      }

      // NOTE: source code for restartWebsockets:
      // https://github.com/thetre97/vue-cli-plugin-apollo/blob/e4a25845386eb2c921b3d1e1b4ee00ce41a88df9/graphql-client/src/index.js#L182
      if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
      
      // store it in memory too
      dispatch('login', { token, userName: name, userId: id })

      // redirect to home page (this avoids a certain defect that happens if you
      // sign up while on the play screen)
      router.push('/')
    },

    login({ commit }, { token, userId, userName }) {
      commit('setToken', token)
      commit('setLoggedIn', true)
      commit('setUserId', userId)
      commit('setUserName', userName)
    },

    async newGame() {
      const { data: { insert_game_session_one: { id } } } = await apolloClient.mutate({
        mutation: insertGameSessionOne
      })

      router.push({ name: 'Play2', query: { id } })
    }
  },

  modules: {
  },
});
