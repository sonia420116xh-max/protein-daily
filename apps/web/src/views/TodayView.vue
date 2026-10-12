<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Dumbbell, Settings, Sparkles, Zap } from 'lucide-vue-next'
import { showToast } from 'vant'
import type { FoodEntry, MealType } from '@protein-daily/shared'
import { todayIso } from '@/data/defaults'
import { useNutritionStore } from '@/stores/nutrition'
import ProgressRing from '@/components/ProgressRing.vue'
import MealSection from '@/components/MealSection.vue'
import EditEntrySheet from '@/components/EditEntrySheet.vue'

const router = useRouter()
const store = useNutritionStore()
store.selectedDate = todayIso
const editing = ref<FoodEntry | null>(null)
const todayLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${todayIso}T12:00:00`))
const training = computed(() => store.isTrainingDate(todayIso))
const meals: { type: MealType; title: string; hint: string }[] = [
  { type: 'breakfast', title: '早餐', hint: '开启有能量的一天' },
  { type: 'lunch', title: '午餐', hint: '记录今天的午餐' },
  { type: 'dinner', title: '晚餐', hint: '记录今天的晚餐' },
  { type: 'snack', title: '加餐', hint: '牛奶、坚果或蛋白粉' },
]
const groupedEntries = computed(() => Object.fromEntries(meals.map(({ type }) => [type, store.entriesForDate.filter((entry) => entry.meal === type)])))

function add(meal: MealType) { router.push({ path: '/record', query: { meal } }) }
function copy(entry: FoodEntry) { store.copyEntry(entry, todayIso); showToast(`已复制 ${entry.foodName}`) }
function save(id: string, patch: Partial<FoodEntry>) { store.updateEntry(id, patch); editing.value = null; showToast('已保存') }
function remove(id: string) { store.removeEntry(id); editing.value = null; showToast('记录已删除') }
</script>

<template>
  <div class="page today-page">
    <header class="page-header">
      <div><p class="eyebrow">PROTEIN DAILY</p><h1 class="page-title">今天吃够了吗？</h1><p class="date-line">{{ todayLabel }} <span v-if="training"><Dumbbell :size="13" /> 训练日</span></p></div>
      <button class="icon-button" type="button" aria-label="设置" @click="router.push('/settings')"><Settings :size="20" /></button>
    </header>

    <section class="summary-card">
      <div class="summary-copy"><span class="summary-kicker">今日蛋白质</span><h2>还差 <strong>{{ store.summaryForDate.remaining }}</strong>g</h2><p>{{ store.summaryForDate.remaining > 0 ? '把缺口拆到接下来的每一餐，更容易完成。' : '今天的目标完成了，保持均衡饮食。' }}</p></div>
      <div class="summary-metrics"><ProgressRing :progress="store.summaryForDate.progress" :consumed="store.summaryForDate.consumed" :target="store.targetForDate" /><span>{{ store.nutritionForDate.maxKcal ? `${store.nutritionForDate.minKcal}–${store.nutritionForDate.maxKcal} kcal` : '热量待补充' }}</span></div>
    </section>

    <section class="powder-strip">
      <div class="powder-icon"><Zap :size="20" /></div>
      <div><span>按当前缺口建议</span><strong>{{ store.powderSuggestion ? `约 ${store.powderSuggestion}g 蛋白粉` : '暂不需要补充' }}</strong></div>
      <small>依据你的配方</small>
    </section>

    <div class="section-heading"><div><span>今日饮食</span><h2>按餐次记录</h2></div><button type="button" @click="router.push('/record')"><Sparkles :size="15" /> AI 拍照</button></div>
    <div class="meal-list">
      <MealSection v-for="meal in meals" :key="meal.type" :meal="meal.type" :title="meal.title" :hint="meal.hint" :entries="groupedEntries[meal.type] || []" @add="add" @edit="editing = $event" @copy="copy" />
    </div>
    <EditEntrySheet :entry="editing" @close="editing = null" @save="save" @remove="remove" />
  </div>
</template>

<style scoped>
.today-page { padding-top: calc(16px + var(--safe-top)); }
.page-header { align-items: flex-start; }
.eyebrow { margin: 0 0 5px; color: #009966; letter-spacing: 1.5px; }
.page-title { margin: 0; }
.date-line { display: flex; align-items: center; gap: 8px; margin: 7px 0 0; color: #72847e; font-size: 12px; }
.date-line span { display: inline-flex; align-items: center; gap: 4px; color: #8a6812; }
.summary-card { min-height: 176px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 22px; padding: 20px; border-radius: 16px; background: #009966; color: #fff; overflow: hidden; }
.summary-copy { min-width: 0; max-width: 230px; }
.summary-kicker { font-size: 12px; font-weight: 650; opacity: .76; }
.summary-copy h2 { margin: 7px 0 8px; font-size: 20px; letter-spacing: 0; }
.summary-copy h2 strong { font-size: 38px; line-height: 1; }
.summary-copy p { margin: 0; font-size: 11px; line-height: 1.55; opacity: .76; }
.summary-metrics { flex: 0 0 auto; text-align: center; }.summary-metrics span { display: block; margin-top: 5px; color: rgba(255,255,255,.8); font-size: 9px; }
.powder-strip { display: grid; grid-template-columns: 38px 1fr auto; align-items: center; gap: 11px; margin-top: 10px; padding: 13px 14px; border: 1px solid #e8e6d9; border-radius: 14px; background: #fffdf4; }
.powder-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; background: #f7e9ad; color: #8b6710; }
.powder-strip span, .powder-strip strong { display: block; }
.powder-strip span { color: #7c7968; font-size: 10px; }
.powder-strip strong { margin-top: 2px; font-size: 14px; }
.powder-strip small { color: #8a8a7b; font-size: 10px; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; margin: 26px 1px 12px; }
.section-heading span { color: #73847e; font-size: 11px; font-weight: 700; }
.section-heading h2 { margin: 2px 0 0; font-size: 19px; }
.section-heading button { display: inline-flex; align-items: center; gap: 5px; min-height: 36px; padding: 0 11px; border: 1px solid #cfe9df; border-radius: 11px; background: #eef9f5; color: #008a5e; font-size: 12px; font-weight: 700; }
.meal-list { display: grid; gap: 10px; }
@media (max-width: 370px) { .summary-card { padding: 17px; } .summary-copy p { display: none; } .powder-strip small { display: none; } }
</style>
