import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/Home.vue';
import PlayView from '../views/Play.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/play',
    name: 'Play',
    component: PlayView,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
