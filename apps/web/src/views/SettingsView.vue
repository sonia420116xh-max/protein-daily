<script setup lang="ts">
import { reactive } from 'vue'
import { ChevronLeft, Download, ShieldCheck } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { UserSettings } from '@protein-daily/shared'
import { useNutritionStore } from '@/stores/nutrition'

const router = useRouter()
const store = useNutritionStore()
const form = reactive<UserSettings>(structuredClone(store.settings))
const week = [{ v: 1, l: '一' }, { v: 2, l: '二' }, { v: 3, l: '三' }, { v: 4, l: '四' }, { v: 5, l: '五' }, { v: 6, l: '六' }, { v: 0, l: '日' }]
function toggleDay(day: number) { form.trainingDays = form.trainingDays.includes(day) ? form.trainingDays.filter((item) => item !== day) : [...form.trainingDays, day] }
function save() { store.updateSettings(form); showToast('设置已保存，历史数据已重算'); router.back() }
function exportData() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), settings: store.settings, entries: store.entries }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = `protein-daily-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page settings-page">
    <header class="page-header"><button class="icon-button" type="button" aria-label="返回" @click="router.back()"><ChevronLeft :size="21" /></button><h1 class="page-title">设置</h1><div class="header-spacer" /></header>
    <section class="profile-band"><div class="avatar">P</div><div><strong>你的蛋白计划</strong><span>参数修改后，所有日期会自动重新计算</span></div></section>
    <form @submit.prevent="save">
      <section class="setting-section"><header><span>身体与目标</span><h2>每日目标</h2></header><div class="setting-fields"><label><span class="field-label">体重</span><div class="input-unit"><input v-model.number="form.weight" class="field" type="number" inputmode="decimal" min="20" max="300" step="0.1" /><b>kg</b></div></label><div class="two-col"><label><span class="field-label">普通日目标</span><div class="input-unit"><input v-model.number="form.normalTarget" class="field" type="number" inputmode="decimal" min="1" /><b>g</b></div></label><label><span class="field-label">训练日目标</span><div class="input-unit"><input v-model.number="form.trainingTarget" class="field" type="number" inputmode="decimal" min="1" /><b>g</b></div></label></div></div></section>
      <section class="setting-section"><header><span>训练安排</span><h2>每周训练日</h2></header><div class="weekday-picker" role="group" aria-label="选择每周训练日"><button v-for="day in week" :key="day.v" type="button" :class="{ active: form.trainingDays.includes(day.v) }" :aria-pressed="form.trainingDays.includes(day.v)" @click="toggleDay(day.v)">{{ day.l }}</button></div><p class="section-note">选中的日期使用训练日目标，其余日期使用普通日目标。</p></section>
      <section class="setting-section"><header><span>补充方案</span><h2>蛋白粉配方</h2></header><div class="two-col"><label><span class="field-label">每份重量</span><div class="input-unit"><input v-model.number="form.powder.servingWeight" class="field" type="number" inputmode="decimal" min="1" /><b>g</b></div></label><label><span class="field-label">每份含蛋白质</span><div class="input-unit"><input v-model.number="form.powder.proteinPerServing" class="field" type="number" inputmode="decimal" min="1" /><b>g</b></div></label></div></section>
      <button class="primary-button save-button" type="submit">保存并重新计算</button>
    </form>
    <section class="data-section"><button type="button" @click="exportData"><Download :size="19" /><div><strong>导出个人数据</strong><span>下载 JSON 格式的饮食记录</span></div></button><div class="privacy"><ShieldCheck :size="18" /><span>当前为本地 Mock 阶段，数据仅保存在此设备浏览器中。</span></div></section>
  </div>
</template>

<style scoped>
.page-header { display: grid; grid-template-columns: 44px 1fr 44px; text-align: center; }.page-title { margin: 0; font-size: 21px; }.header-spacer { width: 44px; }.profile-band { display: flex; align-items: center; gap: 12px; margin: 20px 0; padding: 15px; border-radius: 15px; background: #e8f7f1; }.avatar { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 13px; background: #009966; color: #fff; font-size: 20px; font-weight: 800; }.profile-band strong,.profile-band span { display: block; }.profile-band strong { font-size: 14px; }.profile-band span { margin-top: 3px; color: #57736a; font-size: 10px; }
form { display: grid; gap: 12px; }.setting-section { padding: 16px; border: 1px solid #e2e9e4; border-radius: 15px; background: #fff; }.setting-section header span { color: #71857d; font-size: 10px; font-weight: 700; }.setting-section h2 { margin: 3px 0 15px; font-size: 17px; }.setting-fields { display: grid; gap: 13px; }.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }.input-unit { position: relative; }.input-unit .field { padding-right: 36px; }.input-unit b { position: absolute; top: 15px; right: 13px; color: #82908c; font-size: 11px; }.weekday-picker { display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; }.weekday-picker button { aspect-ratio: 1; min-width: 0; border: 1px solid #dfe7e2; border-radius: 10px; background: #f8faf8; color: #62766f; font-size: 12px; }.weekday-picker button.active { border-color: #009966; background: #009966; color: #fff; font-weight: 750; }.section-note { margin: 10px 0 0; color: #7a8984; font-size: 10px; line-height: 1.5; }.save-button { width: 100%; }
.data-section { margin-top: 22px; padding-top: 18px; border-top: 1px solid #dfe6e1; }.data-section > button { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px; border: 1px solid #e1e8e3; border-radius: 14px; background: #fff; color: #284c42; text-align: left; }.data-section button strong,.data-section button span { display: block; }.data-section button strong { font-size: 13px; }.data-section button span { margin-top: 3px; color: #778780; font-size: 10px; }.privacy { display: flex; align-items: flex-start; gap: 8px; margin-top: 12px; padding: 0 7px; color: #75857f; font-size: 10px; line-height: 1.5; }.privacy svg { flex: 0 0 auto; color: #009966; }
</style>
