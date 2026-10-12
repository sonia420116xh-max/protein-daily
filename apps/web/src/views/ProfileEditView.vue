<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Info, Save } from 'lucide-vue-next'
import { showToast } from 'vant'
import { getWeightBasedNutritionTargets } from '@protein-daily/shared'
import { useNutritionStore } from '@/stores/nutrition'

type OptionalNumber = number | ''
const router = useRouter()
const store = useNutritionStore()
const form = reactive({
  weight: store.settings.weight as number | '',
  height: (store.settings.height ?? '') as OptionalNumber,
  bodyFatPercentage: (store.settings.bodyFatPercentage ?? '') as OptionalNumber,
  waist: (store.settings.waist ?? '') as OptionalNumber,
  hips: (store.settings.hips ?? '') as OptionalNumber,
  chest: (store.settings.chest ?? '') as OptionalNumber,
})
const fields: Array<{ key: 'height' | 'bodyFatPercentage' | 'waist' | 'hips' | 'chest'; label: string; unit: string; placeholder: string; min: number; max: number }> = [
  { key: 'height', label: '身高', unit: 'cm', placeholder: '未填写', min: 80, max: 250 },
  { key: 'bodyFatPercentage', label: '体脂率', unit: '%', placeholder: '未填写', min: 1, max: 70 },
  { key: 'waist', label: '腰围', unit: 'cm', placeholder: '未填写', min: 30, max: 250 },
  { key: 'hips', label: '臀围', unit: 'cm', placeholder: '未填写', min: 30, max: 250 },
  { key: 'chest', label: '胸围', unit: 'cm', placeholder: '未填写', min: 30, max: 250 },
]

function optional(value: OptionalNumber) { return value === '' || value == null ? null : Number(value) }
function save() {
  const weight = Number(form.weight)
  if (!Number.isFinite(weight) || weight < 20 || weight > 300) {
    showToast('请输入 20–300kg 之间的体重')
    return
  }
  const targets = getWeightBasedNutritionTargets(weight)!
  store.updateSettings({
    ...store.settings,
    weight,
    height: optional(form.height),
    bodyFatPercentage: optional(form.bodyFatPercentage),
    waist: optional(form.waist),
    hips: optional(form.hips),
    chest: optional(form.chest),
    normalTarget: targets.protein.min,
    trainingTarget: targets.protein.max,
    profileVersion: 1,
  })
  showToast('个人信息已保存')
  router.back()
}
</script>

<template>
  <div class="page profile-edit-page">
    <header class="page-header"><button class="icon-button" type="button" aria-label="返回" @click="router.back()"><ChevronLeft :size="21" /></button><div><p class="eyebrow">身体档案</p><h1 class="page-title">编辑个人信息</h1></div><div class="header-spacer" /></header>

    <form @submit.prevent="save">
      <section class="form-section required-section">
        <header><span>计算基础</span><h2>当前体重</h2></header>
        <label><span class="field-label">体重 <b>必填</b></span><div class="input-unit"><input v-model.number="form.weight" class="field" type="number" inputmode="decimal" min="20" max="300" step="0.1" required /><strong>kg</strong></div></label>
        <p>营养目标会在保存后根据当前体重重新估算。</p>
      </section>

      <section class="form-section">
        <header><span>可选信息</span><h2>身体数据</h2><p>不填写时保持为空，不会显示为 0。</p></header>
        <div class="field-grid">
          <label v-for="item in fields" :key="item.key"><span class="field-label">{{ item.label }}</span><div class="input-unit"><input v-model.number="form[item.key]" class="field" type="number" inputmode="decimal" :min="item.min" :max="item.max" step="0.1" :placeholder="item.placeholder" /><strong>{{ item.unit }}</strong></div></label>
        </div>
      </section>

      <div class="info-note"><Info :size="18" /><p>这些数据仅保存在当前设备。体脂率和围度用于个人档案记录，目前不会参与热量估算。</p></div>
      <button class="primary-button save-button" type="submit"><Save :size="18" />保存个人信息</button>
    </form>
  </div>
</template>

<style scoped>
.page-header { display: grid; grid-template-columns: 44px 1fr 44px; text-align: center; }.page-header .eyebrow,.page-title { margin: 0; }.page-title { font-size: 21px; }.header-spacer { width: 44px; }form { display: grid; gap: 12px; margin-top: 20px; }.form-section { padding: 16px; border: 1px solid #e1e8e3; border-radius: 15px; background: #fff; }.form-section header > span { color: #009966; font-size: 10px; font-weight: 750; }.form-section h2 { margin: 3px 0 4px; font-size: 17px; }.form-section header p,.required-section > p { margin: 0 0 15px; color: #778780; font-size: 10px; line-height: 1.5; }.required-section { border-color: #cde5da; background: #f8fcfa; }.required-section > p { margin: 9px 0 0; }.field-label b { margin-left: 4px; color: #00875c; font-size: 9px; }.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px 10px; margin-top: 15px; }.input-unit { position: relative; }.input-unit .field { padding-right: 43px; }.input-unit strong { position: absolute; top: 16px; right: 13px; color: #82908c; font-size: 10px; }.info-note { display: flex; align-items: flex-start; gap: 9px; padding: 12px; border-radius: 12px; background: #fff8df; color: #7a6525; }.info-note svg { flex: 0 0 auto; }.info-note p { margin: 0; font-size: 10px; line-height: 1.55; }.save-button { width: 100%; }.field::placeholder { color: #adb8b3; }@media (max-width: 350px) { .field-grid { grid-template-columns: 1fr; } }
</style>
