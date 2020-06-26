import Vue from 'vue';
import Vuex from 'vuex';
import gql from 'graphql-tag';
import router from '../router';
import { apolloClient } from '../main';
import createTempUser from '../gql/createTempUser.gql'

const previouslyLoggedInKey = 'guessing_game_previously_logged_in'
const tokenKey = 'guessing_game_token'
const userNameKey = 'guessing_game_user_name'
const userIdKey = 'guessing_game_user_id'

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
      if (localStorage.getItem(previouslyLoggedInKey) == 'true') {
        const token = localStorage.getItem(tokenKey)
        const userId = localStorage.getItem(userIdKey)
        const userName = localStorage.getItem(userNameKey)

        dispatch('login', { token, userId, userName })
      }
    },

    async signup({ commit, dispatch }) {
      // get a token and new user data
      const { data: { createTempUser: { token, name, id } } } = await apolloClient.mutate({
        mutation: createTempUser,
        variables: {
          name: 'cooluser70'
        },
      })

      localStorage.setItem(previouslyLoggedInKey, 'true')

      // store user data in local storage (i know this is bad but i dont think
      // it's too bad in this case)
      localStorage.setItem(tokenKey, token)
      localStorage.setItem(userIdKey, id)
      localStorage.setItem(userNameKey, name)

      // store it in memory too
      dispatch('login', { token, userName: name, userId: id })
    },

    login({ commit }, { token, userId, userName }) {
      commit('setToken', token)
      commit('setLoggedIn', true)
      commit('setUserId', userId)
      commit('setUserName', userName)
    }
  },

  modules: {
  },
});
