<script setup lang="ts">
import { Copy, MoreHorizontal, Sparkles } from 'lucide-vue-next'
import type { FoodEntry } from '@protein-daily/shared'

defineProps<{ entry: FoodEntry }>()
defineEmits<{ edit: [entry: FoodEntry]; copy: [entry: FoodEntry] }>()

const basisLabels = { cooked: '熟重', raw: '生重', 'bone-in': '带骨', boneless: '去骨' }
</script>

<template>
  <div class="food-row">
    <img v-if="entry.imageUrl" :src="entry.imageUrl" :alt="entry.foodName" class="food-image" />
    <div v-else class="food-mark" aria-hidden="true">{{ entry.foodName.slice(0, 1) }}</div>
    <div class="food-copy">
      <div class="name-line">
        <strong>{{ entry.foodName }}</strong>
        <Sparkles v-if="entry.source === 'ai-estimate'" :size="13" class="ai-icon" aria-label="AI 估算" />
      </div>
      <span v-if="entry.source === 'recipe'">菜谱 · {{ entry.servings }} 份<span v-if="entry.caloriesMax"> · {{ entry.caloriesMin }}–{{ entry.caloriesMax }} kcal</span></span>
      <span v-else>约 {{ entry.estimatedWeight }}g · {{ basisLabels[entry.weightBasis] }}</span>
    </div>
    <div class="protein"><strong>{{ entry.protein }}</strong><span>g</span></div>
    <button class="row-action" type="button" aria-label="复制这项记录" @click="$emit('copy', entry)"><Copy :size="17" /></button>
    <button class="row-action" type="button" aria-label="编辑这项记录" @click="$emit('edit', entry)"><MoreHorizontal :size="19" /></button>
  </div>
</template>

<style scoped>
.food-row { display: flex; align-items: center; gap: 10px; min-height: 68px; padding: 10px 0; border-top: 1px solid #eef1ef; }
.food-image, .food-mark { width: 44px; height: 44px; flex: 0 0 44px; border-radius: 12px; object-fit: cover; }
.food-mark { display: grid; place-items: center; background: #edf7f2; color: #00865b; font-weight: 800; }
.food-copy { min-width: 0; flex: 1; }
.name-line { display: flex; align-items: center; gap: 5px; }
.food-copy strong { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 14px; }
.food-copy span { display: block; margin-top: 3px; color: #778a84; font-size: 11px; }
.ai-icon { color: #e0a71c; flex: 0 0 auto; }
.protein { min-width: 45px; text-align: right; color: #193b32; }
.protein strong { font-size: 17px; }
.protein span { margin-left: 2px; font-size: 11px; color: #73857f; }
.row-action { width: 32px; height: 36px; display: grid; place-items: center; flex: 0 0 32px; border: 0; background: transparent; color: #82918c; padding: 0; }
@media (max-width: 350px) { .food-row { gap: 7px; } .row-action:first-of-type { display: none; } }
</style>
