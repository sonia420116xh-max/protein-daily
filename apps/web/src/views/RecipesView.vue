<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check, ChevronRight, Heart, Search, UtensilsCrossed, X } from 'lucide-vue-next'
import { showToast } from 'vant'
import type { Recipe } from '@protein-daily/shared'
import { scaleRecipeNutrition } from '@protein-daily/shared'
import { recipes, recipeTags } from '@/data/recipes'
import { todayIso } from '@/data/defaults'
import { useNutritionStore } from '@/stores/nutrition'

const route = useRoute()
const router = useRouter()
const store = useNutritionStore()
const requestedMeal = route.query.meal === 'dinner' ? 'dinner' : route.query.meal === 'lunch' ? 'lunch' : 'all'
const mealFilter = ref<'all' | 'lunch' | 'dinner'>(requestedMeal)
const activeTag = ref('')
const search = ref('')
const favoritesOnly = ref(route.query.favorites === '1')
const selected = ref<Recipe | null>(null)
const confirmOpen = ref(false)
const servings = ref(1)
const selectedDate = ref(typeof route.query.date === 'string' ? route.query.date : todayIso)
const selectedMeal = ref<'lunch' | 'dinner'>('lunch')
const pickerMode = route.query.pick === '1'

const filteredRecipes = computed(() => recipes.filter((item) => {
  const matchesMeal = mealFilter.value === 'all' || item.mealType === mealFilter.value
  const term = search.value.trim().toLowerCase()
  const matchesSearch = !term || `${item.name} ${item.ingredients.map((ingredient) => ingredient.name).join(' ')}`.toLowerCase().includes(term)
  const matchesTag = !activeTag.value || item.tags.includes(activeTag.value)
  const matchesFavorite = !favoritesOnly.value || store.favoriteRecipeIds.includes(item.id)
  return matchesMeal && matchesSearch && matchesTag && matchesFavorite
}))
const nutrition = computed(() => selected.value ? scaleRecipeNutrition({
  proteinG: selected.value.proteinEstimateG,
  minKcal: selected.value.energyEstimateKcal.min,
  maxKcal: selected.value.energyEstimateKcal.max,
}, servings.value) : null)

function openRecipe(item: Recipe) { selected.value = item; selectedMeal.value = item.mealType; servings.value = 1 }
function openConfirm() { if (selected.value) confirmOpen.value = true }
function addToLog() {
  if (!selected.value) return
  store.addRecipe(selected.value, { date: selectedDate.value, meal: selectedMeal.value, servings: servings.value })
  showToast(`已记录 ${selected.value.name}`)
  confirmOpen.value = false
  selected.value = null
  void router.push(selectedDate.value === todayIso ? '/' : { name: 'history', query: { date: selectedDate.value } })
}
function clearFilters() { search.value = ''; activeTag.value = ''; mealFilter.value = 'all'; favoritesOnly.value = false }
</script>

<template>
  <div class="page recipes-page">
    <header class="page-header">
      <button v-if="pickerMode" class="icon-button" type="button" aria-label="返回记录" @click="router.back()"><ArrowLeft :size="20" /></button>
      <div><p class="eyebrow">{{ pickerMode ? '从菜谱选择' : '午餐与晚餐' }}</p><h1 class="page-title">今天吃什么？</h1></div>
      <button class="favorite-filter" type="button" :class="{ active: favoritesOnly }" :aria-pressed="favoritesOnly" @click="favoritesOnly = !favoritesOnly"><Heart :size="18" :fill="favoritesOnly ? 'currentColor' : 'none'" /><span>收藏</span></button>
    </header>

    <label class="search-box"><Search :size="18" /><input v-model="search" type="search" placeholder="搜索菜名或食材" aria-label="搜索菜谱" /></label>
    <div class="meal-filter" role="group" aria-label="筛选餐别">
      <button v-for="item in [{v:'all',l:'全部'},{v:'lunch',l:'午餐'},{v:'dinner',l:'晚餐'}]" :key="item.v" :class="{ active: mealFilter === item.v }" @click="mealFilter = item.v as typeof mealFilter">{{ item.l }}</button>
    </div>
    <div class="tag-scroller" aria-label="快捷筛选">
      <button v-for="tag in recipeTags" :key="tag" :class="{ active: activeTag === tag }" @click="activeTag = activeTag === tag ? '' : tag">{{ tag }}</button>
    </div>

    <div v-if="filteredRecipes.length" class="recipe-list">
      <article v-for="item in filteredRecipes" :key="item.id" class="recipe-card">
        <button class="recipe-main" type="button" @click="openRecipe(item)">
          <div class="food-thumb" :class="item.mealType"><UtensilsCrossed :size="24" /><span>{{ item.mealType === 'lunch' ? '午餐' : '晚餐' }}</span></div>
          <div class="recipe-copy"><span class="recipe-code">{{ item.id }} · 营养估算</span><h2>{{ item.name }}</h2><p>{{ item.ingredients.map((ingredient) => `${ingredient.name}${ingredient.weightG}g`).join(' + ') }}</p><div><strong>{{ item.proteinEstimateG }}g 蛋白质</strong><span>{{ item.energyEstimateKcal.min }}–{{ item.energyEstimateKcal.max }} kcal</span></div></div>
          <ChevronRight :size="18" />
        </button>
        <button class="heart-button" type="button" :aria-label="`${store.favoriteRecipeIds.includes(item.id) ? '取消收藏' : '收藏'}${item.name}`" @click="store.toggleRecipeFavorite(item.id)"><Heart :size="18" :fill="store.favoriteRecipeIds.includes(item.id) ? 'currentColor' : 'none'" /></button>
      </article>
    </div>
    <section v-else class="empty-state"><UtensilsCrossed :size="32" /><h2>换个条件试试</h2><p>暂时没有匹配的菜谱。</p><button type="button" @click="clearFilters">清空筛选</button></section>

    <div v-if="selected" class="overlay" role="presentation" @click.self="selected = null">
      <section class="sheet" role="dialog" aria-modal="true" :aria-label="selected.name">
        <header><div><span>{{ selected.mealType === 'lunch' ? '午餐' : '晚餐' }} · 营养均为估算</span><h2>{{ selected.name }}</h2></div><button type="button" aria-label="关闭" @click="selected = null"><X :size="20" /></button></header>
        <div class="detail-summary"><div><span>蛋白质</span><strong>{{ selected.proteinEstimateG }}g</strong></div><div><span>热量</span><strong>{{ selected.energyEstimateKcal.min }}–{{ selected.energyEstimateKcal.max }} kcal</strong></div></div>
        <div class="ingredient-section"><h3>标准食材</h3><ul><li v-for="ingredient in selected.ingredients" :key="ingredient.name"><span>{{ ingredient.name }}</span><strong>{{ ingredient.weightG }}g · {{ ingredient.weightBasis === 'cooked' ? '熟重' : ingredient.weightBasis === 'boneless' ? '去骨/壳生重' : '生重' }}</strong></li></ul></div>
        <div class="notes"><h3>烹饪与耐受提示</h3><p>{{ selected.notes }}</p></div>
        <div class="sheet-actions"><button class="secondary-button" type="button" @click="store.toggleRecipeFavorite(selected.id)"><Heart :size="18" :fill="store.favoriteRecipeIds.includes(selected.id) ? 'currentColor' : 'none'" />{{ store.favoriteRecipeIds.includes(selected.id) ? '已收藏' : '收藏' }}</button><button class="primary-button" type="button" @click="openConfirm">加入今日饮食</button></div>
      </section>
    </div>

    <div v-if="confirmOpen && selected" class="overlay confirm-overlay" role="presentation" @click.self="confirmOpen = false">
      <section class="confirm-sheet" role="dialog" aria-modal="true" aria-label="确认加入饮食">
        <header><div><span>确认后才会计入</span><h2>加入饮食记录</h2></div><button type="button" aria-label="关闭" @click="confirmOpen = false"><X :size="20" /></button></header>
        <label><span>日期</span><input v-model="selectedDate" class="field" type="date" /></label>
        <label><span>餐别</span><select v-model="selectedMeal" class="field"><option value="lunch">午餐</option><option value="dinner">晚餐</option></select></label>
        <fieldset><legend>实际食用份数</legend><button v-for="value in [0.5,1,1.5]" :key="value" type="button" :class="{ active: servings === value }" @click="servings = value"><Check v-if="servings === value" :size="14" />{{ value }} 份</button></fieldset>
        <div v-if="nutrition" class="snapshot"><span>本次营养快照</span><strong>{{ nutrition.proteinG }}g 蛋白质</strong><b>{{ nutrition.minKcal }}–{{ nutrition.maxKcal }} kcal</b></div>
        <button class="primary-button save-recipe" type="button" @click="addToLog">确认加入</button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-header { align-items: flex-start; gap: 10px; }.page-header > div { flex: 1; }.eyebrow,.page-title { margin: 0; }.favorite-filter { min-width: 46px; display: grid; justify-items: center; gap: 2px; border: 0; background: transparent; color: #74857f; font-size: 9px; }.favorite-filter.active,.heart-button { color: #d15f68; }.search-box { min-height: 46px; display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 0 14px; border: 1px solid #dfe7e2; border-radius: 13px; background: #fff; color: #71837d; }.search-box input { width: 100%; border: 0; outline: 0; background: transparent; color: #18302a; }.meal-filter { display: grid; grid-template-columns: repeat(3,1fr); gap: 4px; margin-top: 12px; padding: 4px; border-radius: 12px; background: #e9eeea; }.meal-filter button { min-height: 38px; border: 0; border-radius: 9px; background: transparent; color: #71837d; font-size: 12px; font-weight: 700; }.meal-filter button.active { background: #fff; color: #00865b; box-shadow: 0 2px 8px rgba(30,56,48,.08); }.tag-scroller { display: flex; gap: 7px; overflow-x: auto; margin: 12px -16px 0; padding: 0 16px 5px; scrollbar-width: none; }.tag-scroller button { min-height: 32px; flex: 0 0 auto; padding: 0 12px; border: 1px solid #dce5df; border-radius: 20px; background: #fff; color: #60766f; font-size: 11px; }.tag-scroller button.active { border-color: #009966; background: #eaf7f2; color: #007c55; }.recipe-list { display: grid; gap: 10px; margin-top: 13px; }.recipe-card { position: relative; overflow: hidden; border: 1px solid #e1e8e3; border-radius: 15px; background: #fff; }.recipe-main { width: 100%; display: grid; grid-template-columns: 76px 1fr 18px; align-items: center; gap: 12px; padding: 11px 37px 11px 11px; border: 0; background: transparent; color: inherit; text-align: left; }.food-thumb { width: 76px; height: 88px; display: grid; place-content: center; justify-items: center; gap: 6px; border-radius: 11px; background: #e7f4ed; color: #00865b; }.food-thumb.dinner { background: #fff2df; color: #a96a16; }.food-thumb span { font-size: 10px; font-weight: 750; }.recipe-copy { min-width: 0; }.recipe-code { color: #82908b; font-size: 9px; }.recipe-copy h2 { margin: 3px 0 4px; font-size: 15px; }.recipe-copy p { display: -webkit-box; overflow: hidden; margin: 0; color: #74837f; font-size: 10px; line-height: 1.5; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }.recipe-copy div { display: flex; flex-wrap: wrap; gap: 5px 9px; margin-top: 8px; font-size: 10px; }.recipe-copy strong { color: #00865b; }.recipe-copy div span { color: #725e25; }.heart-button { position: absolute; top: 9px; right: 8px; width: 31px; height: 31px; display: grid; place-items: center; border: 0; background: transparent; }.empty-state { margin-top: 20px; padding: 52px 20px; border: 1px dashed #d6e0da; border-radius: 15px; color: #7a8984; text-align: center; }.empty-state h2 { margin: 12px 0 4px; color: #27473e; font-size: 18px; }.empty-state p { margin: 0; font-size: 12px; }.empty-state button { margin-top: 15px; border: 0; background: transparent; color: #00865b; font-weight: 700; }
.overlay { position: fixed; z-index: 50; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding-top: 50px; background: rgba(16,35,29,.45); }.sheet,.confirm-sheet { width: min(100%,720px); max-height: calc(100dvh - 46px); overflow-y: auto; padding: 20px 18px calc(22px + var(--safe-bottom)); border-radius: 22px 22px 0 0; background: #f8faf7; }.sheet > header,.confirm-sheet > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }.sheet header span,.confirm-sheet header span { color: #71837d; font-size: 10px; }.sheet h2,.confirm-sheet h2 { margin: 3px 0 0; font-size: 22px; }.sheet header button,.confirm-sheet header button { width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 50%; background: #e9efeb; color: #49635b; }.detail-summary { display: grid; grid-template-columns: 1fr 1.4fr; gap: 8px; margin: 18px 0 12px; }.detail-summary div,.snapshot { padding: 13px; border-radius: 12px; background: #e8f7f1; }.detail-summary span,.detail-summary strong { display: block; }.detail-summary span { color: #657b73; font-size: 10px; }.detail-summary strong { margin-top: 4px; color: #007f57; font-size: 16px; }.ingredient-section,.notes { margin-top: 10px; padding: 15px; border: 1px solid #e1e8e3; border-radius: 13px; background: #fff; }.ingredient-section h3,.notes h3 { margin: 0 0 10px; font-size: 13px; }.ingredient-section ul { margin: 0; padding: 0; list-style: none; }.ingredient-section li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid #eef2ef; font-size: 11px; }.ingredient-section li:first-child { border-top: 0; }.ingredient-section li strong { color: #587169; font-weight: 600; }.notes p { margin: 0; color: #6f817b; font-size: 11px; line-height: 1.65; }.sheet-actions { display: grid; grid-template-columns: .75fr 1.25fr; gap: 9px; margin-top: 15px; }.sheet-actions button { width: 100%; }.confirm-overlay { z-index: 60; }.confirm-sheet { display: grid; gap: 13px; }.confirm-sheet label > span,.confirm-sheet legend { display: block; margin-bottom: 7px; color: #49655d; font-size: 12px; font-weight: 700; }.confirm-sheet fieldset { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; margin: 0; padding: 0; border: 0; }.confirm-sheet fieldset button { min-height: 42px; display: flex; align-items: center; justify-content: center; gap: 3px; border: 1px solid #dbe4de; border-radius: 11px; background: #fff; color: #61766f; }.confirm-sheet fieldset button.active { border-color: #009966; background: #e9f7f1; color: #007e57; font-weight: 750; }.snapshot { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; }.snapshot span { grid-column: 1/-1; color: #60776f; font-size: 10px; }.snapshot strong { color: #007e57; }.snapshot b { color: #75601e; font-size: 12px; }.save-recipe { width: 100%; }
</style>
