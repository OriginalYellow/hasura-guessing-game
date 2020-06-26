import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/Home.vue';
import AboutView from '../views/About.vue';
import PlayView from '../views/Play.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
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
