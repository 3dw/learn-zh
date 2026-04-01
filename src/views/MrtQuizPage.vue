<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { speakTextWithPreferredVoice, ZH_TW_PREFERRED_KEYWORDS } from '../utils/speechVoice'

interface Station {
  name: string
  line: string
}

const LINES = ['板南線', '淡水信義線']

const ALL_STATIONS: Station[] = [
  // 板南線
  ...['頂埔','永寧','土城','海山','亞東醫院','府中','板橋','新埔','江子翠',
      '龍山寺','西門','台北車站','善導寺','忠孝新生','忠孝復興','忠孝敦化',
      '國父紀念館','市政府','永春','後山埤','昆陽','南港','南港展覽館']
    .map(name => ({ name, line: '板南線' })),
  // 淡水信義線
  ...['淡水','紅樹林','竹圍','關渡','忠義','復興崗','北投','奇岩','唭哩岸',
      '石牌','明德','芝山','士林','劍潭','圓山','民權西路','中山',
      '台大醫院','中正紀念堂','東門','大安森林公園','大安','信義安和',
      '台北101/世貿','象山']
    .map(name => ({ name, line: '淡水信義線' })),
]

// 排除兩線共站（台北車站）
const STATIONS = ALL_STATIONS.filter(
  s => !(s.name === '台北車站' && s.line === '淡水信義線')
)

function pickRandom<T>(arr: T[], exclude?: T): T {
  const pool = exclude !== undefined ? arr.filter(x => x !== exclude) : arr
  return pool[Math.floor(Math.random() * pool.length)]!
}

function newQuestion() {
  const station = STATIONS[Math.floor(Math.random() * STATIONS.length)]!
  const correct = station.line
  const wrong = pickRandom(LINES, correct)
  const choices = Math.random() < 0.5 ? [correct, wrong] : [wrong, correct]
  return { station, correct, choices }
}

const question = ref(newQuestion())
const selected = ref<string | null>(null)
const score = ref(0)
const streak = ref(0)
const showReward = ref(false)
const totalAnswered = ref(0)

const isCorrect = computed(() => selected.value === question.value.correct)

function speak() {
  speakTextWithPreferredVoice(question.value.station.name, 'zh-TW', ZH_TW_PREFERRED_KEYWORDS)
}

function choose(line: string) {
  if (selected.value !== null) return
  selected.value = line
  totalAnswered.value++
  if (line === question.value.correct) {
    score.value++
    streak.value++
    if (streak.value > 0 && streak.value % 5 === 0) {
      showReward.value = true
    }
  } else {
    streak.value = 0
  }
}

function next() {
  question.value = newQuestion()
  selected.value = null
  speak()
}

function dismissReward() {
  showReward.value = false
  next()
}

onMounted(() => {
  speak()
})
</script>

<template>
  <div class="mrt-quiz">
    <h1>🚇 捷運站名測驗</h1>
    <p class="subtitle">聽站名，猜路線！</p>

    <!-- 獎勵畫面 -->
    <div v-if="showReward" class="reward-overlay" @click="dismissReward">
      <div class="reward-box">
        <div class="reward-emoji">🎉</div>
        <h2>連續答對 {{ streak }} 題！</h2>
        <p>太棒了，繼續加油！</p>
        <button class="btn-next" @click.stop="dismissReward">繼續挑戰</button>
      </div>
    </div>

    <!-- 計分板 -->
    <div class="scoreboard">
      <span>得分：<strong>{{ score }}</strong></span>
      <span>連續答對：<strong>{{ streak }}</strong></span>
      <span>作答：<strong>{{ totalAnswered }}</strong> 題</span>
    </div>

    <!-- 題目 -->
    <div class="question-card">
      <div class="station-name">{{ question.station.name }}</div>
      <button class="btn-speak" @click="speak" title="再聽一次">🔊 朗讀</button>
      <p class="question-text">這個站屬於哪條線？</p>

      <div class="choices">
        <button
          v-for="line in question.choices"
          :key="line"
          class="choice-btn"
          :class="{
            correct: selected !== null && line === question.correct,
            wrong: selected === line && line !== question.correct,
            disabled: selected !== null && line !== question.correct && line !== selected,
          }"
          @click="choose(line)"
        >
          {{ line }}
        </button>
      </div>

      <div v-if="selected !== null" class="result">
        <span v-if="isCorrect" class="correct-msg">✅ 答對了！</span>
        <span v-else class="wrong-msg">❌ 答錯了，是 {{ question.correct }}</span>
        <button class="btn-next" @click="next">下一題 →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mrt-quiz {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--color-text);
  opacity: 0.7;
  margin-bottom: 1.5rem;
}

.scoreboard {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
  margin-bottom: 2rem;
}

.question-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2rem 1.5rem;
}

.station-name {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.btn-speak {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.3rem 0.9rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--color-text);
  margin-bottom: 1.25rem;
}

.btn-speak:hover {
  border-color: hsla(160, 100%, 37%, 0.8);
}

.question-text {
  font-size: 1rem;
  color: var(--color-text);
  margin-bottom: 1.25rem;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.choice-btn {
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 2px solid var(--color-border);
  background: var(--color-background);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s, background 0.15s;
}

.choice-btn:hover:not(.disabled) {
  border-color: hsla(160, 100%, 37%, 0.7);
}

.choice-btn.correct {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #166534;
}

.choice-btn.wrong {
  border-color: #ef4444;
  background: #fef2f2;
  color: #991b1b;
}

.choice-btn.disabled {
  opacity: 0.45;
  cursor: default;
}

.result {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.correct-msg {
  font-size: 1.1rem;
  color: #16a34a;
  font-weight: 600;
}

.wrong-msg {
  font-size: 1rem;
  color: #dc2626;
  font-weight: 600;
}

.btn-next {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-next:hover {
  opacity: 0.85;
}

/* 獎勵overlay */
.reward-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.reward-box {
  background: var(--color-background);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  max-width: 320px;
  width: 90%;
}

.reward-emoji {
  font-size: 4rem;
  margin-bottom: 0.75rem;
}

.reward-box h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.reward-box p {
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
</style>
