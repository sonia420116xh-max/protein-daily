<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { X, Trash2 } from 'lucide-vue-next'
import type { FoodEntry } from '@protein-daily/shared'

const props = defineProps<{ entry: FoodEntry | null }>()
const emit = defineEmits<{ close: []; save: [id: string, patch: Partial<FoodEntry>]; remove: [id: string] }>()
const form = reactive({ foodName: '', estimatedWeight: 0, proteinPer100g: 0, weightBasis: 'cooked' as FoodEntry['weightBasis'] })

watch(() => props.entry, (entry) => {
  if (entry) Object.assign(form, { foodName: entry.foodName, estimatedWeight: entry.estimatedWeight, proteinPer100g: entry.proteinPer100g, weightBasis: entry.weightBasis })
}, { immediate: true })

const canSave = computed(() => form.foodName.trim() && form.estimatedWeight > 0 && form.proteinPer100g > 0)
function save() { if (props.entry && canSave.value) emit('save', props.entry.id, { ...form, foodName: form.foodName.trim(), source: 'manual' }) }
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="entry" class="sheet-layer" @click.self="$emit('close')">
        <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="edit-title">
          <header><div><span>调整记录</span><h2 id="edit-title">编辑食物</h2></div><button class="icon-button" type="button" aria-label="关闭" @click="$emit('close')"><X :size="20" /></button></header>
          <div class="fields">
            <label><span class="field-label">食物名称</span><input v-model="form.foodName" class="field" /></label>
            <div class="field-grid">
              <label><span class="field-label">可食用重量（约 g）</span><input v-model.number="form.estimatedWeight" class="field" type="number" inputmode="decimal" min="1" /></label>
              <label><span class="field-label">每 100g 蛋白质</span><input v-model.number="form.proteinPer100g" class="field" type="number" inputmode="decimal" min="0.1" step="0.1" /></label>
            </div>
            <label><span class="field-label">重量口径</span><select v-model="form.weightBasis" class="field"><option value="cooked">熟重</option><option value="raw">生重</option><option value="bone-in">带骨重量</option><option value="boneless">去骨重量</option></select></label>
          </div>
          <p class="estimate-note">重量和营养数据均为估算值，请根据实际情况调整。</p>
          <div class="actions">
            <button class="delete-button" type="button" aria-label="删除记录" @click="$emit('remove', entry.id)"><Trash2 :size="19" /></button>
            <button class="primary-button" type="button" :disabled="!canSave" @click="save">保存修改</button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-layer { position: fixed; z-index: 80; inset: 0; display: flex; align-items: flex-end; justify-content: center; background: rgba(18,38,32,.38); }
.sheet { width: min(100%, 720px); max-height: min(90dvh, 680px); overflow-y: auto; padding: 18px 18px calc(18px + var(--safe-bottom)); border-radius: 20px 20px 0 0; background: #fff; box-shadow: 0 -12px 40px rgba(23,46,39,.16); }
header { display: flex; align-items: center; justify-content: space-between; }
header span { color: #70847d; font-size: 11px; font-weight: 700; }
h2 { margin: 2px 0 0; font-size: 21px; }
.fields { display: grid; gap: 15px; margin-top: 22px; }
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.estimate-note { margin: 12px 0 18px; color: #71837d; font-size: 12px; line-height: 1.6; }
.actions { display: grid; grid-template-columns: 48px 1fr; gap: 10px; }
.delete-button { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid #f0d9d4; border-radius: 14px; background: #fff8f6; color: #d45944; }
.primary-button:disabled { opacity: .45; }
</style>
