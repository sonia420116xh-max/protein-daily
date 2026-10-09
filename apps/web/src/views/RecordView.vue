<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Camera, ChevronLeft, Image, LoaderCircle, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-vue-next'
import { showToast } from 'vant'
import type { AiFoodCandidate, MealType } from '@protein-daily/shared'
import { calculateFoodProtein } from '@protein-daily/shared'
import { mockCandidates, todayIso } from '@/data/mock'
import { useNutritionStore } from '@/stores/nutrition'
import { compressImage } from '@/utils/image'

type PageState = 'idle' | 'analyzing' | 'result' | 'error' | 'manual'
const route = useRoute()
const router = useRouter()
const store = useNutritionStore()
const cameraInput = ref<HTMLInputElement | null>(null)
const albumInput = ref<HTMLInputElement | null>(null)
const state = ref<PageState>('idle')
const previewUrl = ref('')
const candidates = ref<AiFoodCandidate[]>([])
const meal = ref<MealType>((route.query.meal as MealType) || 'lunch')
const form = reactive({ foodName: '', estimatedWeight: 100, proteinPer100g: 10, weightBasis: 'cooked' as AiFoodCandidate['weightBasis'] })
let shouldMockFail = false

const hasValidCandidates = computed(() => candidates.value.length > 0 && candidates.value.every((item) => item.foodName.trim() && item.estimatedWeight > 0 && item.proteinPer100g > 0))
const manualProtein = computed(() => calculateFoodProtein(form.estimatedWeight, form.proteinPer100g))

async function receiveImage(file?: File) {
  if (!file) return
  state.value = 'analyzing'
  try {
    const blob = await compressImage(file)
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(blob)
    window.setTimeout(() => {
      if (shouldMockFail) { state.value = 'error'; shouldMockFail = false; return }
      candidates.value = structuredClone(mockCandidates)
      state.value = 'result'
    }, 1350)
  } catch { state.value = 'error' }
}

function retry() { state.value = 'analyzing'; window.setTimeout(() => { candidates.value = structuredClone(mockCandidates); state.value = 'result' }, 900) }
function removeCandidate(id: string) { candidates.value = candidates.value.filter((item) => item.id !== id) }
function addCandidate() {
  candidates.value.push({ id: crypto.randomUUID(), foodName: '', estimatedWeight: 100, proteinPer100g: 10, weightBasis: 'cooked', confidenceLabel: '较低', hint: '请手动确认食物信息' })
}
function confirmCandidates() {
  if (!hasValidCandidates.value) return
  for (const item of candidates.value) store.addEntry({ date: todayIso, meal: meal.value, foodName: item.foodName.trim(), estimatedWeight: item.estimatedWeight, proteinPer100g: item.proteinPer100g, weightBasis: item.weightBasis, source: 'ai-estimate', imageUrl: previewUrl.value })
  showToast(`已添加 ${candidates.value.length} 项`)
  router.push('/')
}
function saveManual() {
  if (!form.foodName.trim() || form.estimatedWeight <= 0 || form.proteinPer100g <= 0) return
  store.addEntry({ date: todayIso, meal: meal.value, ...form, foodName: form.foodName.trim(), source: 'manual' })
  showToast('已添加记录')
  router.push('/')
}
onBeforeUnmount(() => { if (previewUrl.value) URL.revokeObjectURL(previewUrl.value) })
</script>

<template>
  <div class="page record-page">
    <header class="page-header">
      <button class="icon-button" type="button" aria-label="返回" @click="router.back()"><ChevronLeft :size="21" /></button>
      <div><p class="eyebrow">添加饮食</p><h1 class="page-title">拍一下，先估算</h1></div>
      <div class="header-spacer" />
    </header>

    <div class="meal-tabs" role="group" aria-label="选择餐次">
      <button v-for="item in [{v:'breakfast',l:'早餐'},{v:'lunch',l:'午餐'},{v:'dinner',l:'晚餐'},{v:'snack',l:'加餐'}]" :key="item.v" :class="{ active: meal === item.v }" @click="meal = item.v as MealType">{{ item.l }}</button>
    </div>

    <section v-if="state === 'idle'" class="capture-area">
      <div class="capture-visual">
        <div class="plate-photo" role="img" aria-label="鸡胸肉与蔬菜餐盘示例"><span><Sparkles :size="17" /> AI 会识别食物和大致份量</span></div>
      </div>
      <div class="capture-copy"><h2>把整份食物放进画面</h2><p>尽量从正上方拍摄，并放入餐具作为大小参照。结果会标明为估算值。</p></div>
      <div class="capture-actions">
        <button class="primary-button" type="button" @click="cameraInput?.click()"><Camera :size="20" /> 拍摄食物</button>
        <button class="secondary-button" type="button" @click="albumInput?.click()"><Image :size="19" /> 从相册选择</button>
      </div>
      <button class="manual-link" type="button" @click="state = 'manual'">没有图片？手动录入</button>
    </section>

    <section v-else-if="state === 'analyzing'" class="analysis-state" aria-live="polite">
      <img v-if="previewUrl" :src="previewUrl" alt="待识别的食物" />
      <div class="scan-line" /><LoaderCircle :size="28" class="spinner" />
      <h2>正在分析这餐</h2><p>识别食物、可食用部分和大致重量…</p>
    </section>

    <section v-else-if="state === 'error'" class="error-state" role="alert">
      <div class="error-icon"><RefreshCw :size="25" /></div><h2>这次没有认出来</h2>
      <p>图片可能太暗或食物有遮挡。你可以换一张，也可以直接手动记录。</p>
      <button class="primary-button" type="button" @click="retry"><RefreshCw :size="18" /> 重试识别</button>
      <button class="secondary-button" type="button" @click="state = 'manual'">手动录入</button>
    </section>

    <section v-else-if="state === 'result'" class="result-state">
      <div class="result-heading"><div><span><Sparkles :size="14" /> AI 估算结果</span><h2>请确认这餐</h2></div><img v-if="previewUrl" :src="previewUrl" alt="已上传的食物" /></div>
      <p class="estimate-banner">以下重量来自图片估算，并非精确测量。请按实际情况修改后再保存。</p>
      <div class="candidate-list">
        <article v-for="(item, index) in candidates" :key="item.id" class="candidate-card">
          <header><strong>食物 {{ index + 1 }}</strong><span :class="`confidence-${item.confidenceLabel}`">把握{{ item.confidenceLabel }}</span><button type="button" aria-label="移除这项食物" @click="removeCandidate(item.id)"><Trash2 :size="17" /></button></header>
          <label><span class="field-label">食物名称</span><input v-model="item.foodName" class="field" /></label>
          <div class="field-row"><label><span class="field-label">约重（g）</span><input v-model.number="item.estimatedWeight" class="field" type="number" inputmode="decimal" /></label><label><span class="field-label">蛋白质/100g</span><input v-model.number="item.proteinPer100g" class="field" type="number" inputmode="decimal" step="0.1" /></label></div>
          <label><span class="field-label">重量口径</span><select v-model="item.weightBasis" class="field"><option value="cooked">熟重</option><option value="raw">生重</option><option value="bone-in">带骨</option><option value="boneless">去骨</option></select></label>
          <footer><span>{{ item.hint }}</span><strong>约 {{ calculateFoodProtein(item.estimatedWeight, item.proteinPer100g) }}g 蛋白质</strong></footer>
        </article>
      </div>
      <button class="add-candidate" type="button" @click="addCandidate"><Plus :size="18" /> 添加漏掉的食物</button>
      <button class="primary-button confirm" type="button" :disabled="!hasValidCandidates" @click="confirmCandidates">确认并保存</button>
    </section>

    <section v-else class="manual-state">
      <div class="manual-heading"><span>手动录入</span><h2>记录一项食物</h2><p>使用包装营养表或常用营养数据库的数据。</p></div>
      <div class="manual-form">
        <label><span class="field-label">食物名称</span><input v-model="form.foodName" class="field" placeholder="例如：鸡胸肉" /></label>
        <div class="field-row"><label><span class="field-label">可食用重量（g）</span><input v-model.number="form.estimatedWeight" class="field" type="number" inputmode="decimal" /></label><label><span class="field-label">蛋白质/100g</span><input v-model.number="form.proteinPer100g" class="field" type="number" inputmode="decimal" step="0.1" /></label></div>
        <label><span class="field-label">重量口径</span><select v-model="form.weightBasis" class="field"><option value="cooked">熟重</option><option value="raw">生重</option><option value="bone-in">带骨</option><option value="boneless">去骨</option></select></label>
        <div class="protein-preview"><span>预计蛋白质</span><strong>{{ manualProtein }}g</strong></div>
        <button class="primary-button" type="button" :disabled="!form.foodName.trim()" @click="saveManual">保存记录</button>
      </div>
    </section>

    <input ref="cameraInput" hidden type="file" accept="image/*" capture="environment" @change="receiveImage(($event.target as HTMLInputElement).files?.[0])" />
    <input ref="albumInput" hidden type="file" accept="image/*" @change="receiveImage(($event.target as HTMLInputElement).files?.[0])" />
  </div>
</template>

<style scoped>
.page-header { display: grid; grid-template-columns: 44px 1fr 44px; text-align: center; }.page-header .eyebrow { margin: 0 0 3px; color: #688078; }.page-title { font-size: 21px; }.header-spacer { width: 44px; }
.meal-tabs { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; margin: 20px 0 15px; padding: 4px; border-radius: 12px; background: #e9eeea; }.meal-tabs button { min-height: 36px; border: 0; border-radius: 9px; background: transparent; color: #73837e; font-size: 12px; font-weight: 650; }.meal-tabs button.active { background: #fff; color: #007f57; box-shadow: 0 2px 8px rgba(30,56,48,.08); }
.capture-area { overflow: hidden; padding-bottom: 18px; border: 1px solid #e3eae5; border-radius: 16px; background: #fff; }.capture-visual { padding: 10px; }.plate-photo { aspect-ratio: 1.32; display: flex; align-items: flex-end; padding: 14px; border-radius: 12px; background: linear-gradient(180deg,transparent 45%,rgba(13,32,25,.58)), url('https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=84') center/cover; }.plate-photo span { display: inline-flex; align-items: center; gap: 6px; color: #fff; font-size: 12px; font-weight: 650; }.capture-copy { padding: 8px 20px 14px; text-align: center; }.capture-copy h2 { margin: 0; font-size: 20px; }.capture-copy p { margin: 8px 0 0; color: #71837d; font-size: 12px; line-height: 1.65; }.capture-actions { display: grid; gap: 9px; padding: 0 18px; }.manual-link { width: 100%; margin-top: 14px; border: 0; background: transparent; color: #547168; font-size: 12px; text-decoration: underline; text-underline-offset: 3px; }
.analysis-state,.error-state { min-height: 430px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; border: 1px solid #e3eae5; border-radius: 16px; background: #fff; }.analysis-state img { width: 190px; height: 190px; border-radius: 50%; object-fit: cover; filter: saturate(.85); }.spinner { margin-top: 22px; color: #009966; animation: spin 1s linear infinite; }.analysis-state h2,.error-state h2 { margin: 13px 0 5px; font-size: 20px; }.analysis-state p,.error-state p { max-width: 290px; margin: 0; color: #71837d; font-size: 12px; line-height: 1.6; }.error-state { gap: 10px; }.error-icon { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 50%; background: #fff0ec; color: #d55e48; }.error-state .primary-button,.error-state .secondary-button { width: 100%; margin-top: 5px; }
.result-heading { display: flex; align-items: center; justify-content: space-between; }.result-heading span { display: flex; align-items: center; gap: 5px; color: #947012; font-size: 11px; font-weight: 700; }.result-heading h2 { margin: 4px 0 0; font-size: 22px; }.result-heading img { width: 58px; height: 58px; border-radius: 13px; object-fit: cover; }.estimate-banner { margin: 13px 0; padding: 10px 12px; border-radius: 10px; background: #fff8db; color: #735d20; font-size: 11px; line-height: 1.55; }.candidate-list { display: grid; gap: 10px; }.candidate-card { padding: 15px; border: 1px solid #e1e9e4; border-radius: 14px; background: #fff; }.candidate-card header { display: flex; align-items: center; gap: 8px; margin-bottom: 13px; }.candidate-card header strong { font-size: 14px; }.candidate-card header span { padding: 3px 7px; border-radius: 20px; background: #eef7f3; color: #4e7467; font-size: 9px; }.candidate-card header button { margin-left: auto; border: 0; background: transparent; color: #a47469; }.candidate-card label { display: block; margin-top: 11px; }.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }.candidate-card footer { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: 13px; }.candidate-card footer span { max-width: 56%; color: #7c8b86; font-size: 10px; line-height: 1.4; }.candidate-card footer strong { color: #007f57; font-size: 12px; }.add-candidate { width: 100%; min-height: 43px; display: flex; align-items: center; justify-content: center; gap: 6px; margin: 10px 0; border: 1px dashed #c7d9d0; border-radius: 12px; background: transparent; color: #497066; font-size: 12px; }.confirm { width: 100%; }.confirm:disabled,.manual-form .primary-button:disabled { opacity: .45; }
.manual-heading { padding: 12px 2px 18px; }.manual-heading span { color: #009966; font-size: 11px; font-weight: 700; }.manual-heading h2 { margin: 4px 0; font-size: 23px; }.manual-heading p { margin: 0; color: #74857f; font-size: 12px; }.manual-form { display: grid; gap: 14px; padding: 17px; border: 1px solid #e1e9e4; border-radius: 15px; background: #fff; }.protein-preview { display: flex; align-items: center; justify-content: space-between; padding: 13px; border-radius: 11px; background: #eef8f3; color: #316356; }.protein-preview span { font-size: 12px; }.protein-preview strong { color: #00875c; font-size: 20px; }.manual-form .primary-button { width: 100%; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
