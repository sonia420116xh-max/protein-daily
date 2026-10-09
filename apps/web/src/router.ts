import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'today', component: () => import('./views/TodayView.vue') },
    { path: '/record', name: 'record', component: () => import('./views/RecordView.vue') },
    { path: '/history', name: 'history', component: () => import('./views/HistoryView.vue') },
    { path: '/settings', name: 'settings', component: () => import('./views/SettingsView.vue') },
  ],
})
