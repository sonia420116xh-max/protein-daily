<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { FoodEntry, MealType } from '@protein-daily/shared'
import FoodEntryRow from './FoodEntryRow.vue'

defineProps<{ meal: MealType; title: string; hint: string; entries: FoodEntry[] }>()
defineEmits<{ add: [meal: MealType]; edit: [entry: FoodEntry]; copy: [entry: FoodEntry] }>()
</script>

<template>
  <section class="meal-section">
    <header>
      <div><h2>{{ title }}</h2><span>{{ entries.length ? `${entries.reduce((sum, item) => sum + item.protein, 0).toFixed(1)}g 蛋白质` : hint }}</span></div>
      <button type="button" :aria-label="`添加${title}`" @click="$emit('add', meal)"><Plus :size="20" /></button>
    </header>
    <FoodEntryRow v-for="entry in entries" :key="entry.id" :entry="entry" @edit="$emit('edit', $event)" @copy="$emit('copy', $event)" />
    <button v-if="!entries.length" type="button" class="empty-add" @click="$emit('add', meal)"><Plus :size="16" /> 添加一项</button>
  </section>
</template>

<style scoped>
.meal-section { padding: 15px 16px 5px; border: 1px solid #e5ebe7; border-radius: 15px; background: #fff; }
header { min-height: 43px; display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
h2 { margin: 0; font-size: 16px; line-height: 1.3; }
header span { display: block; margin-top: 3px; color: #81908b; font-size: 11px; }
header button { width: 34px; height: 34px; display: grid; place-items: center; border: 0; border-radius: 10px; background: #eef8f3; color: #008b60; }
.empty-add { width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: center; gap: 5px; margin: 0 0 8px; border: 1px dashed #cbdad2; border-radius: 10px; background: #fafcfa; color: #587068; font-size: 13px; }
</style>
