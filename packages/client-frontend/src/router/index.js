import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '@/views/Home.vue';
import PlayView from '@/views/Play';
import PlayView2 from '@/views/Play2';

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
  {
    path: '/play2',
    name: 'Play2',
    component: PlayView2,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
