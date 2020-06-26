import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import '@babel/polyfill';
import { createClient, createProvider } from './vue-apollo';
// NOTE: https://github.com/caiobiodere/cordova-template-framework7-vue-webpack/issues/94
import babelPolyfill from 'babel-polyfill'

Vue.config.productionTip = false;

// create and export the apollo client here so it can be imported and used in
// other files
export const apolloClient = createClient();

new Vue({
  router,
  store,
  vuetify,
  apolloProvider: createProvider(apolloClient),
  render: (h) => h(App),
  created() {
    store.dispatch('refreshLogin');
  }
}).$mount('#app');
