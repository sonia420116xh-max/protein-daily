<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-vue-next'
import type { FoodEntry, MealType } from '@protein-daily/shared'
import { isValidIsoDate } from '@protein-daily/shared'
import { todayIso } from '@/data/defaults'
import { useNutritionStore } from '@/stores/nutrition'
import { getChinaCalendarDay } from '@/utils/chinaCalendar'
import EditEntrySheet from '@/components/EditEntrySheet.vue'

const route = useRoute()
const router = useRouter()
const store = useNutritionStore()
const routeDate = typeof route.query.date === 'string' && isValidIsoDate(route.query.date) ? route.query.date : todayIso
const activeMonth = ref(new Date(`${routeDate}T12:00:00`))
const selected = ref(routeDate)
const editing = ref<FoodEntry | null>(null)
const weekDays = ['一', '二', '三', '四', '五', '六', '日']
const mealNames: Record<MealType, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }

const monthLabel = computed(() => new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(activeMonth.value))
const calendarDays = computed(() => {
  const year = activeMonth.value.getFullYear(), month = activeMonth.value.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: days }, (_, index) => {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
      const summary = store.summaryByDate(date)
      const dayOfWeek = new Date(`${date}T12:00:00`).getDay()
      return {
        date,
        day: index + 1,
        summary,
        training: store.isTrainingDate(date),
        weekend: dayOfWeek === 0 || dayOfWeek === 6,
        calendar: getChinaCalendarDay(date),
      }
    }),
  ]
})
const selectedEntries = computed(() => store.entriesByDate(selected.value))
const selectedSummary = computed(() => store.summaryByDate(selected.value))
const selectedTarget = computed(() => store.targetByDate(selected.value))
const selectedTraining = computed(() => store.isTrainingDate(selected.value))
const selectedLabel = computed(() => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${selected.value}T12:00:00`)))

function moveMonth(offset: number) { activeMonth.value = new Date(activeMonth.value.getFullYear(), activeMonth.value.getMonth() + offset, 1) }
function selectDate(date: string) {
  selected.value = date
  void router.replace({ name: 'history', query: { date } })
}
function addEntry() { void router.push({ name: 'record', query: { date: selected.value, from: 'history' } }) }
function save(id: string, patch: Partial<FoodEntry>) { store.updateEntry(id, patch); editing.value = null }
function remove(id: string) { store.removeEntry(id); editing.value = null }
</script>

<template>
  <div class="page history-page">
    <header class="page-header"><div><p class="eyebrow">回顾趋势</p><h1 class="page-title">历史记录</h1></div><div class="month-nav"><button type="button" aria-label="上个月" @click="moveMonth(-1)"><ChevronLeft :size="19" /></button><strong>{{ monthLabel }}</strong><button type="button" aria-label="下个月" @click="moveMonth(1)"><ChevronRight :size="19" /></button></div></header>
    <section class="calendar" aria-label="蛋白质月历">
      <div v-for="(day, index) in weekDays" :key="day" class="weekday" :class="{ weekend: index > 4 }">{{ day }}</div>
      <template v-for="(item, index) in calendarDays" :key="item?.date || `blank-${index}`">
        <div v-if="!item" class="day blank" />
        <button v-else type="button" class="day" :class="{ selected: selected === item.date, today: todayIso === item.date, weekend: item.weekend && item.calendar.status !== 'workday', holiday: item.calendar.status === 'holiday' }" :aria-label="`${item.date}${item.calendar.name ? `，${item.calendar.name}${item.calendar.status === 'holiday' ? '休息' : '补班'}` : ''}，摄入 ${item.summary.consumed} 克`" @click="selectDate(item.date)">
          <i v-if="item.training" class="training-mark"><Dumbbell :size="9" /></i>
          <span v-if="item.calendar.status" class="calendar-status" :class="item.calendar.status">{{ item.calendar.status === 'holiday' ? '休' : '班' }}</span>
          <span class="day-number">{{ item.day }}</span>
          <small class="holiday-name">{{ item.calendar.name }}</small>
          <div class="mini-bar"><b :style="{ width: `${item.summary.progress}%` }" /></div>
        </button>
      </template>
      <footer><span><i class="legend-dot complete" /> 已完成</span><span><i class="legend-dot partial" /> 有记录</span><span><i class="legend-status holiday">休</i> 法定假日</span><span><i class="legend-status workday">班</i> 调休上班</span><span><Dumbbell :size="12" /> 训练日</span></footer>
    </section>

    <section class="day-detail">
      <header><div><span>{{ selectedLabel }}</span><h2>{{ selectedEntries.length ? `${selectedSummary.consumed} / ${selectedTarget}g` : '这天还没有记录' }}</h2></div><div class="day-actions"><button type="button" class="training-toggle" :class="{ active: selectedTraining }" :aria-pressed="selectedTraining" @click="store.toggleTrainingDate(selected)"><Dumbbell :size="15" />{{ selectedTraining ? '训练日' : '设为训练日' }}</button><div v-if="selectedEntries.length" class="day-rate">{{ selectedSummary.progress }}%</div></div></header>
      <button type="button" class="add-entry" @click="addEntry"><Plus :size="18" /> 补记食物</button>
      <div v-if="selectedEntries.length" class="history-list">
        <button v-for="entry in selectedEntries" :key="entry.id" type="button" @click="editing = entry">
          <div class="meal-mark">{{ mealNames[entry.meal].slice(0, 1) }}</div>
          <div><strong>{{ entry.foodName }}</strong><span>{{ mealNames[entry.meal] }} · 约 {{ entry.estimatedWeight }}g</span></div>
          <b>{{ entry.protein }}g</b>
        </button>
      </div>
      <div v-else class="empty-history"><span>—</span><p>这天还没有饮食记录，可以补记当时吃过的食物。</p></div>
    </section>
    <EditEntrySheet :entry="editing" @close="editing = null" @save="save" @remove="remove" />
  </div>
</template>

<style scoped>
.page-header { align-items: flex-end; }.eyebrow { margin: 0 0 4px; color: #009966; }.page-title { margin: 0; }.month-nav { display: flex; align-items: center; gap: 6px; }.month-nav strong { min-width: 76px; text-align: center; font-size: 13px; }.month-nav button { width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: 9px; background: #eaf0ec; color: #49635b; }
.calendar { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin-top: 20px; padding: 14px 10px 10px; border: 1px solid #e1e8e3; border-radius: 16px; background: #fff; }.weekday { padding: 4px 0 8px; text-align: center; color: #83918d; font-size: 10px; font-weight: 650; }.weekday.weekend { color: #b86b68; }.day { position: relative; height: 58px; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 6px 2px 5px; border: 0; border-radius: 9px; background: transparent; color: #51655f; font-size: 12px; }.day.blank { visibility: hidden; }.day.weekend,.day.holiday { color: #b85f5a; }.day.today .day-number { font-weight: 800; color: #00875d; }.day.selected { background: #e8f7f1; color: #007c55; box-shadow: inset 0 0 0 1px #c8eadc; }.day-number { line-height: 18px; }.training-mark { position: absolute; top: 4px; left: 3px; color: #a97b0b; }.calendar-status { position: absolute; top: 3px; right: 3px; width: 15px; height: 15px; display: grid; place-items: center; border-radius: 50%; font-size: 8px; font-weight: 800; line-height: 1; }.calendar-status.holiday,.legend-status.holiday { background: #fae8e6; color: #b44742; }.calendar-status.workday,.legend-status.workday { background: #edf0ee; color: #65736e; }.holiday-name { width: 100%; min-height: 11px; overflow: hidden; color: currentColor; font-size: 8px; line-height: 11px; text-align: center; text-overflow: ellipsis; white-space: nowrap; }.mini-bar { width: 72%; height: 3px; overflow: hidden; margin-top: auto; border-radius: 3px; background: #e8edea; }.mini-bar b { display: block; height: 100%; border-radius: inherit; background: #00a874; }.calendar footer { grid-column: 1/-1; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 7px 10px; padding-top: 9px; border-top: 1px solid #eef1ef; color: #7a8984; font-size: 9px; }.calendar footer span { display: flex; align-items: center; gap: 4px; }.legend-dot { width: 7px; height: 7px; border-radius: 50%; }.legend-status { width: 14px; height: 14px; display: grid; place-items: center; border-radius: 50%; font-size: 8px; font-style: normal; font-weight: 800; }.complete { background: #009966; }.partial { background: #e8b931; }
.day-detail { margin-top: 18px; }.day-detail > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 0 2px 10px; }.day-detail header span { color: #71837d; font-size: 11px; }.day-detail h2 { margin: 3px 0 0; font-size: 18px; }.day-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }.training-toggle { min-height: 34px; display: inline-flex; align-items: center; gap: 5px; padding: 0 9px; border: 1px solid #d9e2dd; border-radius: 9px; background: #fff; color: #63766f; font-size: 10px; font-weight: 700; white-space: nowrap; }.training-toggle.active { border-color: #dfbd55; background: #fff8dc; color: #8b6811; }.day-rate { min-width: 48px; padding: 7px 8px; border-radius: 9px; background: #e9f7f1; color: #00865b; text-align: center; font-size: 12px; font-weight: 750; }.add-entry { width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 10px; border: 1px solid #cce4da; border-radius: 11px; background: #eef8f4; color: #007f58; font-size: 12px; font-weight: 750; }.history-list { overflow: hidden; border: 1px solid #e3e9e5; border-radius: 15px; background: #fff; }.history-list button { width: 100%; min-height: 66px; display: grid; grid-template-columns: 38px 1fr auto; align-items: center; gap: 11px; padding: 10px 13px; border: 0; border-top: 1px solid #edf1ee; background: #fff; text-align: left; }.history-list button:first-child { border-top: 0; }.meal-mark { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px; background: #f0f5f1; color: #537168; font-size: 12px; font-weight: 750; }.history-list strong,.history-list span { display: block; }.history-list strong { font-size: 14px; }.history-list span { margin-top: 3px; color: #7b8985; font-size: 10px; }.history-list b { color: #007f58; font-size: 14px; }.empty-history { padding: 30px 20px; border: 1px dashed #d5dfd9; border-radius: 14px; text-align: center; color: #83908c; }.empty-history span { font-size: 28px; }.empty-history p { margin: 5px 0 0; font-size: 12px; }
@media (max-width: 360px) { .day-detail > header { align-items: flex-start; }.day-actions { max-width: 130px; } }
</style>
