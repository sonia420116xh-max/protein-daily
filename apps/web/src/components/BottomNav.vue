<script setup lang="ts">
import { CalendarDays, CirclePlus, House } from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()
const items = [
  { label: '今日', to: '/', icon: House },
  { label: '记录', to: '/record', icon: CirclePlus },
  { label: '历史', to: '/history', icon: CalendarDays },
]
</script>

<template>
  <nav class="bottom-nav" aria-label="主导航">
    <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="nav-item" :class="{ active: route.path === item.to }">
      <component :is="item.icon" :size="22" :stroke-width="route.path === item.to ? 2.5 : 2" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav { position: fixed; z-index: 30; left: 0; right: 0; bottom: 0; height: calc(68px + var(--safe-bottom)); padding: 6px max(18px, env(safe-area-inset-left)) var(--safe-bottom) max(18px, env(safe-area-inset-right)); display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid rgba(220,230,223,.9); background: rgba(255,255,255,.94); backdrop-filter: blur(18px); }
.nav-item { position: relative; min-width: 0; color: #74857f; text-decoration: none; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 3px; font-size: 11px; font-weight: 650; }
.nav-item.active { color: #009966; }
.nav-item.active::before { content: ''; position: absolute; top: -6px; width: 28px; height: 3px; border-radius: 0 0 4px 4px; background: #009966; }
@media (min-width: 720px) { .bottom-nav { left: 50%; right: auto; width: 720px; transform: translateX(-50%); border-radius: 0 0 24px 24px; } }
</style>
