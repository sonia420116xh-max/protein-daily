<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ progress: number; consumed: number; target: number }>()
const radius = 54
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => circumference * (1 - Math.min(100, props.progress) / 100))
</script>

<template>
  <div class="ring-wrap" :aria-label="`已完成 ${progress}%`" role="img">
    <svg viewBox="0 0 128 128" aria-hidden="true">
      <circle cx="64" cy="64" :r="radius" class="track" />
      <circle cx="64" cy="64" :r="radius" class="fill" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" />
    </svg>
    <div class="ring-copy"><strong>{{ consumed }}</strong><span>/ {{ target }}g</span></div>
  </div>
</template>

<style scoped>
.ring-wrap { position: relative; width: 128px; height: 128px; flex: 0 0 128px; }
svg { width: 100%; height: 100%; transform: rotate(-90deg); }
circle { fill: none; stroke-width: 10; }
.track { stroke: rgba(255,255,255,.28); }
.fill { stroke: #fff; stroke-linecap: round; transition: stroke-dashoffset .5s ease; }
.ring-copy { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; }
.ring-copy strong { font-size: 31px; line-height: 1; letter-spacing: 0; }
.ring-copy span { margin-top: 5px; font-size: 12px; opacity: .8; }
</style>
