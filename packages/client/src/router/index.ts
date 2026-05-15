import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/decks',
      name: 'decks',
      component: () => import('../pages/DecksPage.vue'),
    },
    {
      path: '/my-decks',
      name: 'my-decks',
      component: () => import('../pages/MyDecksPage.vue'),
    },
    {
      path: '/decks/new',
      name: 'decks-new',
      component: () => import('../pages/CreateDeckPage.vue'),
    },
    {
      path: '/decks/:id',
      name: 'deck-detail',
      component: () => import('../pages/DeckDetailPage.vue'),
    },
    {
      path: '/decks/:id/edit',
      name: 'deck-edit',
      component: () => import('../pages/EditDeckPage.vue'),
    },
    {
      path: '/decks/:id/study',
      name: 'deck-study',
      component: () => import('../pages/StudyPage.vue'),
    },
  ],
})

export default router
