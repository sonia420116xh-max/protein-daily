<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Dumbbell, Heart, Pencil, Ruler, ShieldCheck, UserRound } from 'lucide-vue-next'
import { getWeightBasedNutritionTargets } from '@protein-daily/shared'
import { useNutritionStore } from '@/stores/nutrition'

const router = useRouter()
const store = useNutritionStore()
const trainingDaysLabel = computed(() => store.settings.trainingDays.map((day) => ['日','一','二','三','四','五','六'][day]).join('、'))
const targets = computed(() => getWeightBasedNutritionTargets(store.settings.weight)!)
const profileDetails = computed(() => [
  store.settings.height ? `${store.settings.height}cm` : '',
  store.settings.bodyFatPercentage ? `体脂 ${store.settings.bodyFatPercentage}%` : '',
].filter(Boolean).join(' · '))
</script>

<template>
  <div class="page profile-page">
    <header class="profile-header">
      <div class="avatar"><UserRound :size="26" /></div>
      <div><p class="eyebrow">我的计划</p><h1 class="page-title">个人营养档案</h1><span>{{ store.settings.weight }}kg<span v-if="profileDetails"> · {{ profileDetails }}</span> · 增肌及缓慢增重</span></div>
      <button class="icon-button" type="button" aria-label="编辑个人信息" @click="router.push('/profile/edit')"><Pencil :size="18" /></button>
    </header>

    <section class="energy-card">
      <p class="section-label">每日热量参考</p>
      <div class="energy-grid"><div><span>训练日 · 周{{ trainingDaysLabel }}</span><strong>{{ targets.trainingCalories.min.toLocaleString() }}–{{ targets.trainingCalories.max.toLocaleString() }}</strong><small>kcal / 天，按 {{ store.settings.weight }}kg 估算</small></div><div><span>休息日</span><strong>{{ targets.restCalories.min.toLocaleString() }}–{{ targets.restCalories.max.toLocaleString() }}</strong><small>kcal / 天，按 {{ store.settings.weight }}kg 估算</small></div></div>
      <div class="divider" />
      <h2>每天的营养分配目标</h2>
      <div class="macro"><div><strong>蛋白质</strong><span>{{ targets.protein.min }}–{{ targets.protein.max }}g</span></div><div class="bar"><i class="protein" /></div></div>
      <div class="macro"><div><strong>碳水化合物</strong><span>训练日 {{ targets.trainingCarbs.min }}–{{ targets.trainingCarbs.max }}g</span></div><div class="bar"><i class="carbs" /></div></div>
      <div class="macro"><div><strong>脂肪</strong><span>{{ targets.fat.min }}–{{ targets.fat.max }}g</span></div><div class="bar"><i class="fat" /></div></div>
      <p class="card-note">休息日碳水可在约{{ targets.restCarbs.min }}–{{ targets.restCarbs.max }}g范围内调整。以上区间根据当前体重动态估算，不要求每天全部达到上限。</p>
    </section>

    <section class="today-snapshot">
      <header><div><span>今天的记录</span><h2>{{ store.nutritionForDate.proteinG }}g 蛋白质</h2></div><strong v-if="store.nutritionForDate.maxKcal">{{ store.nutritionForDate.minKcal }}–{{ store.nutritionForDate.maxKcal }} kcal</strong><strong v-else>暂无热量估算</strong></header>
      <div class="progress"><i :style="{ width: `${store.summaryForDate.progress}%` }" /></div>
    </section>

    <button class="body-profile-link" type="button" @click="router.push('/profile/edit')"><Ruler :size="19" /><div><strong>个人信息</strong><span>身高、体重、体脂率与身体围度</span></div><ChevronRight :size="18" /></button>

    <section class="profile-links">
      <button type="button" @click="router.push({ path: '/recipes', query: { favorites: '1' } })"><Heart :size="19" /><div><strong>我的收藏</strong><span>{{ store.favoriteRecipeIds.length }} 道常吃菜谱</span></div><ChevronRight :size="18" /></button>
      <button type="button" @click="router.push('/settings')"><Dumbbell :size="19" /><div><strong>训练与蛋白目标</strong><span>调整体重、训练日和蛋白粉配方</span></div><ChevronRight :size="18" /></button>
    </section>

    <div class="health-note"><ShieldCheck :size="19" /><p><strong>健康提示</strong><span>没有充分证据支持腺肌症绝对禁食清单。根据个人胃肠反应调整咖啡和辛辣食物；本页不作为医学治疗建议。</span></p></div>
  </div>
</template>

<style scoped>
.profile-header { display: grid; grid-template-columns: 48px 1fr 42px; align-items: center; gap: 11px; }.avatar { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 15px; background: #009966; color: #fff; }.profile-header .eyebrow,.profile-header .page-title { margin: 0; }.profile-header .page-title { font-size: 21px; }.profile-header span { display: block; margin-top: 4px; color: #73847e; font-size: 10px; }.energy-card { margin-top: 20px; padding: 17px; border-radius: 17px; background: #183d34; color: #fff; box-shadow: 0 12px 30px rgba(19,52,43,.15); }.section-label { margin: 0 0 12px; color: #b9cbc5; font-size: 10px; font-weight: 700; }.energy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }.energy-grid div + div { padding-left: 13px; border-left: 1px solid rgba(255,255,255,.14); }.energy-grid span,.energy-grid strong,.energy-grid small { display: block; }.energy-grid span { color: #c8d6d1; font-size: 9px; }.energy-grid strong { margin-top: 5px; font-size: 21px; letter-spacing: -.4px; }.energy-grid small { margin-top: 5px; color: #aebfba; font-size: 9px; }.divider { height: 1px; margin: 17px 0; background: rgba(255,255,255,.1); }.energy-card h2 { margin: 0 0 13px; font-size: 14px; }.macro { margin-top: 11px; }.macro > div:first-child { display: flex; align-items: center; justify-content: space-between; font-size: 11px; }.macro span { color: #e4ebe8; }.bar { height: 7px; overflow: hidden; margin-top: 7px; border-radius: 7px; background: rgba(255,255,255,.13); }.bar i { display: block; height: 100%; border-radius: inherit; }.protein { width: 26%; background: #20b985; }.carbs { width: 55%; background: #f1ad42; }.fat { width: 19%; background: #6ca5d8; }.card-note { margin: 13px 0 0; color: #b8c9c3; font-size: 9px; line-height: 1.55; }.today-snapshot { margin-top: 12px; padding: 15px; border: 1px solid #e1e8e3; border-radius: 14px; background: #fff; }.today-snapshot header { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }.today-snapshot span { color: #74857f; font-size: 10px; }.today-snapshot h2 { margin: 3px 0 0; font-size: 17px; }.today-snapshot header > strong { color: #846a1a; font-size: 11px; }.progress { height: 6px; overflow: hidden; margin-top: 12px; border-radius: 6px; background: #e8edea; }.progress i { display: block; height: 100%; border-radius: inherit; background: #009966; }.profile-links { overflow: hidden; margin-top: 12px; border: 1px solid #e1e8e3; border-radius: 14px; background: #fff; }.profile-links button { width: 100%; min-height: 64px; display: grid; grid-template-columns: 32px 1fr 20px; align-items: center; gap: 8px; padding: 10px 13px; border: 0; border-top: 1px solid #edf1ee; background: #fff; color: #31554b; text-align: left; }.profile-links button:first-child { border-top: 0; }.profile-links strong,.profile-links span { display: block; }.profile-links strong { font-size: 13px; }.profile-links span { margin-top: 3px; color: #7a8984; font-size: 9px; }.health-note { display: flex; align-items: flex-start; gap: 10px; margin-top: 13px; padding: 13px; border-radius: 13px; background: #fff8e3; color: #84691e; }.health-note svg { flex: 0 0 auto; }.health-note p { margin: 0; }.health-note strong,.health-note span { display: block; }.health-note strong { font-size: 11px; }.health-note span { margin-top: 4px; color: #786b45; font-size: 9px; line-height: 1.55; }
.body-profile-link { width: 100%; min-height: 62px; display: grid; grid-template-columns: 32px 1fr 20px; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 13px; border: 1px solid #cfe3da; border-radius: 14px; background: #eef8f4; color: #31554b; text-align: left; }.body-profile-link strong,.body-profile-link span { display: block; }.body-profile-link strong { font-size: 13px; }.body-profile-link span { margin-top: 3px; color: #6d817a; font-size: 9px; }
</style>
