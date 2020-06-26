import Vue from 'vue';
import Vuex from 'vuex';
import gql from 'graphql-tag';
import router from '../router';
import { apolloClient } from '../main';
import createTempUser from '../gql/createTempUser.gql'

Vue.use(Vuex);

const set = property => (state, payload) => (state[property] = payload);

const toggle = property => state => (state[property] = !state[property]);

export default new Vuex.Store({
  state: {
    loggedIn: false,
    token: null
  },
  
  mutations: {
    setLoggedIn: set('loggedIn'),
    setToken: set('token')
  },
  
  actions: {
    async signup({ _, commit }) {
      const { data: { createTempUser: { token} } } = await apolloClient.mutate({
        mutation: createTempUser,
        variables: {
          name: 'cooluser69'
        },
      })

      commit('setToken', token)
    }
  },

  modules: {
  },
});
