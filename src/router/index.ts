import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/custom',
      name: 'custom',
      component: () => import('../views/CustomPage.vue'),
    },
    {
      path: '/three-character',
      name: 'three-character',
      component: () => import('../views/ThreeCharacterPage.vue'),
    },
    {
      path: '/what-is-this',
      name: 'what-is-this',
      component: () => import('../views/WhatIsThisPage.vue'),
    },
    {
      path: '/bannan-line-quiz',
      name: 'bannan-line-quiz',
      component: () => import('../views/BannanLineQuizPage.vue'),
    },
    {
      path: '/tamshui-line-quiz',
      name: 'tamshui-line-quiz',
      component: () => import('../views/BannanLineQuizPage.vue'),
    },
    {
      path: '/circular-line-quiz',
      name: 'circular-line-quiz',
      component: () => import('../views/BannanLineQuizPage.vue'),
    },
    {
      path: '/line-quiz/:lineKey(bannan|tamshui|circular)',
      name: 'line-quiz',
      component: () => import('../views/BannanLineQuizPage.vue'),
    },
    {
      path: '/mrt-quiz',
      name: 'mrt-quiz',
      component: () => import('../views/MrtQuizPage.vue'),
    },
  ],
})

export default router
