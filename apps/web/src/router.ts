import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'today', component: () => import('./views/TodayView.vue') },
    { path: '/record', name: 'record', component: () => import('./views/RecordView.vue') },
    { path: '/recipes', name: 'recipes', component: () => import('./views/RecipesView.vue') },
    { path: '/history', name: 'history', component: () => import('./views/HistoryView.vue') },
    { path: '/profile', name: 'profile', component: () => import('./views/ProfileView.vue') },
    { path: '/profile/edit', name: 'profile-edit', component: () => import('./views/ProfileEditView.vue') },
    { path: '/settings', name: 'settings', component: () => import('./views/SettingsView.vue') },
  ],
})
