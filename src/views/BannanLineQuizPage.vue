<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getPreferredZhTwVoice, getVoicesAsync } from '@/utils/speechVoice'

type Station = { id: string; name: string; hint: string }

const STATIONS: Station[] = [
  { id: 'BL01', name: '頂埔', hint: '板南線西端起點站，位於土城區西南角' },
  { id: 'BL02', name: '永寧', hint: '土城區站，鄰近永寧路商圈' },
  { id: 'BL03', name: '土城', hint: '土城區行政中心附近' },
  { id: 'BL04', name: '海山', hint: '板橋與土城交界，鄰近海山高中' },
  { id: 'BL05', name: '亞東醫院', hint: '緊鄰亞東紀念醫院，醫療資源豐富' },
  { id: 'BL06', name: '府中', hint: '板橋區中心，鄰近板橋府中商圈' },
  { id: 'BL07', name: '板橋', hint: '板橋區重要轉運站，也是台鐵板橋站' },
  { id: 'BL08', name: '新埔', hint: '板橋東側，新埔商圈所在地' },
  { id: 'BL09', name: '江子翠', hint: '板橋北端，鄰近新北大都會公園' },
  { id: 'BL10', name: '龍山寺', hint: '萬華區，萬年香火鼎盛的古廟旁' },
  { id: 'BL11', name: '西門', hint: '萬華與中正區交界，台北最熱鬧的商圈之一' },
  { id: 'BL12', name: '台北車站', hint: '全台最大交通樞紐，多線交會' },
  { id: 'BL13', name: '善導寺', hint: '台北東區門戶，鄰近台北市立圖書館總館' },
  { id: 'BL14', name: '忠孝新生', hint: '東西向要道忠孝東路與新生南路交口' },
  { id: 'BL15', name: '忠孝復興', hint: '大安區精華地帶，百貨商圈聚集' },
  { id: 'BL16', name: '忠孝敦化', hint: '敦化南北路與忠孝東路交叉，精品街' },
  { id: 'BL17', name: '國父紀念館', hint: '鄰近國父紀念館公園，松山文創園區附近' },
  { id: 'BL18', name: '市政府', hint: '台北市政府所在地，鄰近101大樓' },
  { id: 'BL19', name: '永春', hint: '信義區東側，永春高中附近' },
  { id: 'BL20', name: '後山埤', hint: '信義區與南港交界，後山埤公園' },
  { id: 'BL21', name: '昆陽', hint: '南港區，昆陽工業區附近' },
  { id: 'BL22', name: '南港', hint: '南港區中心，台鐵南港站轉乘' },
  { id: 'BL23', name: '南港展覽館', hint: '台北南港展覽館所在，大型展覽場地' },
]

const TOTAL_Q = 15
const OPT_COLOR_CLASSES = ['opt-c0', 'opt-c1', 'opt-c2', 'opt-c3'] as const

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]!
    a[i] = a[j]!
    a[j] = t
  }
  return a
}

function buildPool(): Station[] {
  return shuffle([...STATIONS]).slice(0, TOTAL_Q)
}

function getOptions(target: Station): string[] {
  const others = STATIONS.filter((s) => s.id !== target.id)
  const shuffled = shuffle(others)
    .slice(0, 3)
    .map((s) => s.name)
  return shuffle([target.name, ...shuffled])
}

function shuffleOptionColors(): string[] {
  return shuffle([...OPT_COLOR_CLASSES])
}

const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
const voiceEnabled = ref(true)
const speechRate = ref(0.85)
const zhVoice = ref<SpeechSynthesisVoice | null>(null)
const speakingOptionIndex = ref<number | null>(null)
const replayBusy = ref(false)
const labelFlashName = ref<string | null>(null)

const pool = ref<Station[]>(buildPool())
const current = ref(0)
const score = ref(0)
const answered = ref(false)
const history = ref<{ station: string; correct: boolean }[]>([])
const firstQ = pool.value[0]
const currentOptions = ref<string[]>(firstQ ? getOptions(firstQ) : [])
const optionColorByIndex = ref<string[]>(shuffleOptionColors())

const feedbackKind = ref<'empty' | 'correct' | 'wrong'>('empty')
const feedbackText = ref('')

const fireworksCanvas = ref<HTMLCanvasElement | null>(null)
const mapScrollEl = ref<HTMLElement | null>(null)
let fwResizeHandler: (() => void) | null = null
let fwParticles: Array<{
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  r: number
  gravity: number
  decay: number
}> = []
let fwRunning = false
let fwRaf: number | null = null
let speakSessionId = 0

async function refreshZhVoice() {
  if (!ttsSupported) return
  const voices = await getVoicesAsync()
  zhVoice.value = getPreferredZhTwVoice(voices)
}

function stopSpeech() {
  speakSessionId++
  if (ttsSupported) window.speechSynthesis.cancel()
  speakingOptionIndex.value = null
  replayBusy.value = false
}

function attachUtterance(
  text: string,
  rate: number,
  onEnd?: () => void,
): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'zh-TW'
  if (zhVoice.value) {
    u.voice = zhVoice.value
    u.lang = zhVoice.value.lang
  }
  u.rate = rate
  /** 略降音高可減輕部分系統預設聲線的「金屬／刮耳」感 */
  u.pitch = 0.96
  u.volume = 1
  let settled = false
  const finalize = () => {
    if (settled) return
    settled = true
    onEnd?.()
  }
  u.onend = finalize
  u.onerror = finalize
  return u
}

function speakText(text: string, onEnd?: () => void) {
  if (!ttsSupported || !voiceEnabled.value || !zhVoice.value) {
    onEnd?.()
    return
  }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(attachUtterance(text, speechRate.value, onEnd))
}

async function speakOptionsSequentially() {
  if (!ttsSupported || !zhVoice.value || current.value >= pool.value.length) return
  const sessionId = ++speakSessionId
  replayBusy.value = true
  window.speechSynthesis.cancel()

  const prompt = '這個站叫什麼名字？'
  const opts = currentOptions.value
  let i = 0

  const speakNextOption = () => {
    if (sessionId !== speakSessionId) return
    if (i >= opts.length) {
      speakingOptionIndex.value = null
      replayBusy.value = false
      return
    }
    speakingOptionIndex.value = i
    const u = attachUtterance(opts[i]!, speechRate.value, () => {
      if (sessionId !== speakSessionId) return
      speakingOptionIndex.value = null
      i++
      window.setTimeout(speakNextOption, 300)
    })
    window.speechSynthesis.speak(u)
  }

  const intro = attachUtterance(prompt, speechRate.value, () => {
    if (sessionId !== speakSessionId) return
    window.setTimeout(speakNextOption, 180)
  })
  window.speechSynthesis.speak(intro)
}

function speakStationLabel(name: string) {
  if (!ttsSupported || !voiceEnabled.value || !zhVoice.value) return
  labelFlashName.value = name
  window.setTimeout(() => {
    if (labelFlashName.value === name) labelFlashName.value = null
  }, 1000)
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(attachUtterance(name, speechRate.value))
}

function speakFeedback(isRight: boolean, name: string) {
  if (!voiceEnabled.value || !ttsSupported) return
  const msg = isRight ? `答對了！這站是${name}` : `答錯了，正確答案是${name}`
  speakText(msg)
}

const lineMapSlice = computed(() => {
  const q = pool.value[current.value]
  if (!q) return [] as { station: Station; globalIdx: number }[]
  const targetIdx = STATIONS.findIndex((s) => s.id === q.id)
  const start = Math.max(0, targetIdx - 2)
  const end = Math.min(STATIONS.length - 1, targetIdx + 2)
  return STATIONS.slice(start, end + 1).map((station, i) => ({
    station,
    globalIdx: start + i,
  }))
})

const progressPct = computed(() =>
  Math.min(100, Math.round((current.value / TOTAL_Q) * 100)),
)

const showQuiz = computed(
  () => current.value < TOTAL_Q && pool.value[current.value] != null,
)

const resultPercent = computed(() =>
  Math.round((score.value / TOTAL_Q) * 100),
)

const resultMessage = computed(() => {
  const pct = resultPercent.value
  const s = score.value
  if (s === TOTAL_Q) return '完美！全部答對！🎉'
  if (pct >= 80) return '太棒了！非常熟練！'
  if (pct >= 60) return '不錯喔！繼續加油！'
  return '多練習幾次，加油！'
})

function initGame() {
  stopSpeech()
  pool.value = buildPool()
  current.value = 0
  score.value = 0
  answered.value = false
  history.value = []
  prepareQuestion()
}

function prepareQuestion() {
  answered.value = false
  feedbackKind.value = 'empty'
  feedbackText.value = ''
  const q = pool.value[current.value]
  if (!q) return
  currentOptions.value = getOptions(q)
  optionColorByIndex.value = shuffleOptionColors()
  nextTick(() => {
    scrollMapToTarget()
    if (voiceEnabled.value && ttsSupported) {
      void speakOptionsSequentially()
    }
  })
}

function scrollMapToTarget() {
  const el = mapScrollEl.value?.querySelector('.station-dot.target')
  el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
}

function chooseOption(name: string) {
  if (answered.value) return
  answered.value = true
  const q = pool.value[current.value]!
  const correct = q.name
  const isRight = name === correct
  if (isRight) {
    score.value++
    window.setTimeout(() => launchFireworks(), 100)
  }
  history.value.push({ station: correct, correct: isRight })

  feedbackKind.value = isRight ? 'correct' : 'wrong'
  feedbackText.value = isRight
    ? `答對了！這站是「${correct}」`
    : `答錯了，正確答案是「${correct}」`

  speakFeedback(isRight, correct)
}

const wrongPick = ref<string | null>(null)

watch(answered, (a) => {
  if (!a) wrongPick.value = null
})

function onChoose(label: string) {
  if (answered.value) return
  const q = pool.value[current.value]!
  if (label !== q.name) wrongPick.value = label
  chooseOption(label)
}

function nextQuestion() {
  stopSpeech()
  current.value++
  wrongPick.value = null
  if (current.value >= TOTAL_Q) {
    window.setTimeout(() => {
      speakText(
        `遊戲結束！你答對了 ${score.value} 題，答對率 ${resultPercent.value} 百分比。${resultMessage.value}`,
      )
    }, 300)
    return
  }
  prepareQuestion()
}

function isOptionDisabled() {
  return answered.value
}

function optionClassFor(idx: number, label: string) {
  const base = optionColorByIndex.value[idx] ?? 'opt-c0'
  const out: (string | Record<string, boolean>)[] = ['option-btn', base]
  if (!answered.value) {
    if (speakingOptionIndex.value === idx) out.push('speaking-highlight')
    return out
  }
  const q = pool.value[current.value]
  if (!q) return out
  const correctName = q.name
  const wasRight = history.value[current.value]?.correct
  if (label === correctName) {
    if (!wasRight) out.push('reveal')
    else out.push('correct')
  }
  if (wasRight === false && label !== correctName && label === wrongPick.value) {
    out.push('wrong')
  }
  return out
}

watch(voiceEnabled, (on) => {
  if (!on) stopSpeech()
})

onMounted(() => {
  void refreshZhVoice()
  if (ttsSupported) {
    window.speechSynthesis.addEventListener('voiceschanged', refreshZhVoice)
  }
  initFireworks()
  initGame()
})

onBeforeUnmount(() => {
  stopSpeech()
  if (ttsSupported) {
    window.speechSynthesis.removeEventListener('voiceschanged', refreshZhVoice)
  }
  if (fwRaf != null) cancelAnimationFrame(fwRaf)
  if (fwResizeHandler) {
    window.removeEventListener('resize', fwResizeHandler)
    fwResizeHandler = null
  }
})

function initFireworks() {
  const canvas = fireworksCanvas.value
  if (!canvas) return
  if (fwResizeHandler) {
    window.removeEventListener('resize', fwResizeHandler)
  }
  fwResizeHandler = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  fwResizeHandler()
  window.addEventListener('resize', fwResizeHandler)
}

function burst(x: number, y: number, color: string) {
  const canvas = fireworksCanvas.value
  if (!canvas) return
  const count = 60
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3
    const speed = 3 + Math.random() * 6
    fwParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color,
      r: 3 + Math.random() * 3,
      gravity: 0.12,
      decay: 0.015 + Math.random() * 0.01,
    })
  }
}

function launchFireworks() {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
  const w = window.innerWidth
  const h = window.innerHeight
  const spots: [number, number][] = [
    [w * 0.25, h * 0.3],
    [w * 0.5, h * 0.2],
    [w * 0.75, h * 0.3],
    [w * 0.35, h * 0.45],
    [w * 0.65, h * 0.4],
  ]
  spots.forEach((s, i) => {
    window.setTimeout(() => {
      burst(s[0], s[1], colors[i % colors.length]!)
      burst(
        s[0] + (Math.random() - 0.5) * 80,
        s[1] + (Math.random() - 0.5) * 60,
        colors[(i + 3) % colors.length]!,
      )
    }, i * 120)
  })
  if (!fwRunning) fireworksLoop()
}

function fireworksLoop() {
  const canvas = fireworksCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  fwRunning = true
  const step = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    fwParticles = fwParticles.filter((p) => p.alpha > 0.02)
    fwParticles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += p.gravity
      p.vx *= 0.98
      p.alpha -= p.decay
      ctx.save()
      ctx.globalAlpha = Math.max(0, p.alpha)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
    if (fwParticles.length > 0) {
      fwRaf = requestAnimationFrame(step)
    } else {
      fwRunning = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
  fwRaf = requestAnimationFrame(step)
}

watch(fireworksCanvas, (c) => {
  if (c) initFireworks()
})
</script>

<template>
  <div class="quiz-root">
    <canvas id="fireworks-canvas" ref="fireworksCanvas" aria-hidden="true" />

    <div class="header">
      <div class="line-badge">BL</div>
      <div>
        <div class="header-title">板南線 站名學習</div>
        <div class="header-sub">Bannan Line · 認識 23 個車站</div>
      </div>
      <div class="header-score">
        <div class="score-num">{{ score }}</div>
        <div class="score-label">答對題數</div>
      </div>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" :style="{ width: progressPct + '%' }" />
    </div>

    <div v-if="showQuiz" class="main">
      <div v-if="!ttsSupported" class="no-tts-notice">
        此瀏覽器不支援語音播報功能，建議使用 Chrome 或 Edge。
      </div>
      <div v-else class="voice-bar">
        <label class="voice-toggle" :class="{ on: voiceEnabled }">
          <input v-model="voiceEnabled" type="checkbox" />
          語音播報
        </label>
        <div class="voice-sep" />
        <button
          type="button"
          class="speak-btn"
          :class="{ speaking: replayBusy }"
          :disabled="replayBusy || !voiceEnabled"
          @click="speakOptionsSequentially"
        >
          <span class="voice-icon">🔈</span>
          再聽一次
        </button>
        <div class="speed-wrap">
          速度：
          <select v-model.number="speechRate">
            <option :value="0.6">慢速</option>
            <option :value="0.85">正常</option>
            <option :value="1.1">快速</option>
          </select>
        </div>
      </div>

      <div class="map-section">
        <div class="map-section-title">板南線地圖 — 找出 ？ 是哪一站</div>
        <div ref="mapScrollEl" class="map-scroll">
          <div class="line-map">
            <div
              v-for="({ station: s, globalIdx }, i) in lineMapSlice"
              :key="s.id"
              class="station-wrap"
            >
              <div
                v-if="s.id === pool[current]!.id"
                class="station-label hidden-label"
              >
                <span>？</span>
              </div>
              <button
                v-else
                type="button"
                class="station-label clickable"
                :title="'點我聽讀：' + s.name"
                :class="{ 'label-speaking': labelFlashName === s.name }"
                @click="speakStationLabel(s.name)"
              >
                {{ s.name }}
              </button>
              <div class="dot-row">
                <div
                  :class="{
                    'station-dot': true,
                    terminal:
                      (i === 0 && globalIdx === 0) ||
                      (i === lineMapSlice.length - 1 && globalIdx === STATIONS.length - 1),
                    target: s.id === pool[current]!.id,
                  }"
                />
              </div>
              <div class="station-num">{{ s.id }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="question-card">
        <div class="question-text">這個站叫什麼名字？</div>
        <div class="question-hint">提示：{{ pool[current]!.hint }}</div>
      </div>

      <div class="options-grid">
        <button
          v-for="(label, idx) in currentOptions"
          :key="idx + label"
          type="button"
          :class="optionClassFor(idx, label)"
          :disabled="isOptionDisabled()"
          @click="onChoose(label)"
        >
          {{ label }}
        </button>
      </div>

      <div v-if="feedbackKind !== 'empty'" class="feedback" :class="feedbackKind">
        <span class="feedback-icon">{{ feedbackKind === 'correct' ? '✓' : '✗' }}</span>
        {{ feedbackText }}
      </div>
      <div v-else class="feedback empty" />

      <button v-if="answered" type="button" class="next-btn" @click="nextQuestion">
        {{ current < TOTAL_Q - 1 ? '下一題 →' : '查看結果 →' }}
      </button>
    </div>

    <div v-else class="main">
      <div class="result-wrap">
        <div class="result-circle">
          <div class="result-num">{{ score }}</div>
          <div class="result-denom">/ {{ TOTAL_Q }} 題</div>
        </div>
        <div class="result-title">{{ resultMessage }}</div>
        <div class="result-sub">答對率 {{ resultPercent }}%，共考了 {{ TOTAL_Q }} 站</div>
        <div class="result-review">
          <div class="review-title">本次答題紀錄</div>
          <div
            v-for="(h, i) in history"
            :key="i"
            class="review-item"
          >
            <div class="review-dot" :class="h.correct ? 'ok' : 'ng'" />
            <span class="review-id">{{ pool[i]!.id }}</span>
            <span class="review-name">{{ h.station }}</span>
            <span
              class="review-flag"
              :class="h.correct ? 'ok-text' : 'ng-text'"
            >
              {{ h.correct ? '✓ 答對' : '✗ 答錯' }}
            </span>
          </div>
        </div>
        <button type="button" class="restart-btn" @click="initGame">
          再挑戰一次
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Barlow+Condensed:wght@600;700&display=swap');

.quiz-root {
  --blue: #0070bd;
  --blue-dark: #004f8a;
  --blue-light: #e6f3fb;
  --blue-mid: #b5d4f4;
  --correct: #1a7c4f;
  --correct-bg: #e6f4ee;
  --wrong: #b22222;
  --wrong-bg: #fdecea;
  --text: #1a1a2e;
  --text-muted: #5a6070;
  --bg: #f4f7fb;
  --card: #ffffff;
  --border: #d8e4f0;
  --station-size: 12px;
  --line-w: 6px;
  --station-gap: 44px;
  --main-pad-x: 1rem;

  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
  font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--text);
  margin: 0;
}

#fireworks-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.header {
  background: var(--blue);
  color: white;
  padding: 1rem 1.5rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  box-shadow: 0 2px 12px rgba(0, 112, 189, 0.25);
}

.header > div:nth-child(2) {
  min-width: 0;
  flex: 1 1 140px;
}

.line-badge {
  background: white;
  color: var(--blue);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 22px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
}

.header-sub {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 2px;
}

.header-score {
  margin-left: auto;
  text-align: right;
  flex-shrink: 0;
}

.score-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 11px;
  opacity: 0.75;
}

.progress-bar-wrap {
  height: 5px;
  background: var(--blue-dark);
}

.progress-bar-fill {
  height: 5px;
  background: white;
  transition: width 0.4s ease;
}

.main {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.25rem var(--main-pad-x) 2rem;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}

.map-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem 0.75rem 1rem;
  margin-bottom: 1rem;
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

.map-section-title {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.map-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  min-width: 0;
  overscroll-behavior-x: contain;
}

.line-map {
  display: flex;
  align-items: stretch;
  width: max-content;
  min-width: max-content;
  max-width: none;
  padding: 0 12px;
}

.station-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.station-wrap + .station-wrap {
  margin-left: var(--station-gap);
}

.station-label {
  min-height: 40px;
  height: auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: normal;
  text-align: center;
  padding-bottom: 5px;
  max-width: 5.2rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
  word-break: keep-all;
}

.station-label.clickable {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
  border-radius: 6px;
  padding: 3px 6px 5px;
  transition: background 0.15s;
}

.station-label.clickable:hover {
  background: var(--blue-light);
  color: var(--blue-dark);
}

.station-label.clickable:active {
  background: var(--blue-mid);
}

@keyframes labelSpeak {
  0%,
  100% {
    background: var(--blue-light);
  }
  50% {
    background: var(--blue-mid);
  }
}

.station-label.label-speaking {
  animation: labelSpeak 0.5s ease-in-out 2;
}

.station-label.hidden-label {
  align-items: center;
  padding-bottom: 0;
}

.station-label.hidden-label span {
  background: #ff6b00;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
}

.dot-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 100%;
}

.dot-row::before,
.dot-row::after {
  content: '';
  position: absolute;
  top: 50%;
  height: var(--line-w);
  background: var(--blue);
  transform: translateY(-50%);
  z-index: 0;
}

.dot-row::before {
  left: 0;
  width: 50%;
}

.dot-row::after {
  right: 0;
  width: 50%;
}

.station-wrap:first-child .dot-row::before {
  display: none;
}

.station-wrap:last-child .dot-row::after {
  display: none;
}

.station-dot {
  width: var(--station-size);
  height: var(--station-size);
  border-radius: 50%;
  background: white;
  border: 3px solid var(--blue);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  transition: all 0.2s;
}

.station-dot.terminal {
  width: 16px;
  height: 16px;
  background: var(--blue);
  border-color: white;
  border-width: 2px;
}

.station-dot.target {
  width: 18px;
  height: 18px;
  background: #ff6b00;
  border-color: white;
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.2);
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.25);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 107, 0, 0.05);
  }
}

.station-num {
  font-size: 10px;
  color: var(--blue);
  margin-top: 5px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 600;
  white-space: nowrap;
}

.question-card {
  background: var(--blue-light);
  border: 1px solid var(--blue-mid);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--blue-dark);
  line-height: 1.5;
}

.question-hint {
  font-size: 16px;
  color: var(--blue-dark);
  opacity: 0.8;
  margin-top: 8px;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.55;
}

@keyframes optHighlight {
  0% {
    filter: brightness(0.82) saturate(1.4);
    transform: scale(1.04);
  }
  50% {
    filter: brightness(0.75) saturate(1.6);
    transform: scale(1.06);
  }
  100% {
    filter: brightness(0.82) saturate(1.4);
    transform: scale(1.04);
  }
}

.option-btn.speaking-highlight {
  animation: optHighlight 0.5s ease-in-out 2;
  outline: 3px solid rgba(0, 0, 0, 0.18);
  outline-offset: 2px;
}

.opt-c0 {
  background: #fff3cd;
  border-color: #f0c040;
  color: #5c4400;
}

.opt-c1 {
  background: #d4edda;
  border-color: #5cb87a;
  color: #154e27;
}

.opt-c2 {
  background: #d1ecf1;
  border-color: #5ba7b5;
  color: #0c4f5c;
}

.opt-c3 {
  background: #f8d7da;
  border-color: #e08090;
  color: #6b1a24;
}

.opt-c0:hover:not(:disabled) {
  background: #ffe8a0;
  border-color: #d4a800;
}

.opt-c1:hover:not(:disabled) {
  background: #b8dfc4;
  border-color: #3a9a5c;
}

.opt-c2:hover:not(:disabled) {
  background: #b0d8e0;
  border-color: #3a8a98;
}

.opt-c3:hover:not(:disabled) {
  background: #f0b8be;
  border-color: #c05060;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 1rem;
}

.option-btn {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 22px 12px;
  font-family: inherit;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  line-height: 1.3;
  min-height: 76px;
}

.option-btn:hover:not(:disabled) {
  border-color: var(--blue);
  background: var(--blue-light);
  color: var(--blue-dark);
  transform: translateY(-1px);
}

.option-btn.correct {
  background: var(--correct-bg);
  border-color: var(--correct);
  color: var(--correct);
}

.option-btn.wrong {
  background: var(--wrong-bg);
  border-color: var(--wrong);
  color: var(--wrong);
}

.option-btn.reveal {
  background: var(--correct-bg);
  border-color: var(--correct);
  color: var(--correct);
  opacity: 0.55;
}

.option-btn:disabled {
  cursor: default;
  transform: none;
}

.feedback {
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
}

.feedback.empty {
  background: transparent;
  border: none;
  min-height: 0;
  margin-bottom: 0;
  padding: 0;
}

.feedback.correct {
  background: var(--correct-bg);
  color: var(--correct);
  border: 1px solid #a8d5bc;
}

.feedback.wrong {
  background: var(--wrong-bg);
  color: var(--wrong);
  border: 1px solid #f5b8b8;
}

.feedback-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.next-btn {
  width: 100%;
  padding: 13px;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
  letter-spacing: 0.5px;
}

.next-btn:hover {
  background: var(--blue-dark);
}

.next-btn:active {
  transform: scale(0.98);
}

.result-wrap {
  text-align: center;
  padding: 2rem 1rem 1rem;
}

.result-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--blue);
  margin: 0 auto 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 24px rgba(0, 112, 189, 0.3);
}

.result-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}

.result-denom {
  font-size: 13px;
  opacity: 0.8;
}

.result-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.result-sub {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 1.75rem;
}

.result-review {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.review-title {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.review-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 4px;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  border-top: 1px solid var(--border);
}

.review-item:first-of-type {
  border-top: none;
}

.review-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.review-dot.ok {
  background: var(--correct);
}

.review-dot.ng {
  background: var(--wrong);
}

.review-id {
  color: var(--text-muted);
  min-width: 36px;
  font-size: 12px;
}

.review-name {
  font-weight: 500;
  min-width: 0;
  flex: 1 1 120px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.review-flag {
  margin-left: auto;
  font-size: 12px;
}

.review-flag.ok-text {
  color: var(--correct);
}

.review-flag.ng-text {
  color: var(--wrong);
}

.restart-btn {
  padding: 13px 40px;
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.restart-btn:hover {
  background: var(--blue-dark);
}

.voice-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  row-gap: 8px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 1rem;
  max-width: 100%;
  box-sizing: border-box;
}

.voice-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
}

.voice-toggle input[type='checkbox'] {
  accent-color: var(--blue);
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.voice-toggle.on {
  color: var(--blue-dark);
  font-weight: 500;
}

.speak-btn {
  background: var(--blue-light);
  border: 1px solid var(--blue-mid);
  border-radius: 8px;
  color: var(--blue-dark);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s;
  white-space: nowrap;
}

.speak-btn:hover:not(:disabled) {
  background: var(--blue-mid);
}

.speak-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.speak-btn.speaking {
  background: var(--blue);
  color: white;
  border-color: var(--blue-dark);
}

.voice-icon {
  font-size: 15px;
  line-height: 1;
}

.voice-sep {
  width: 1px;
  height: 20px;
  background: var(--border);
  flex-shrink: 0;
}

.speed-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}

.speed-wrap select {
  font-family: inherit;
  font-size: 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 6px;
  color: var(--text);
  background: var(--card);
  cursor: pointer;
}

.no-tts-notice {
  font-size: 12px;
  color: var(--text-muted);
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 1rem;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .quiz-root {
    --station-gap: 30px;
    --main-pad-x: 0.75rem;
  }

  .header {
    padding: 0.75rem var(--main-pad-x) 0.65rem;
    gap: 10px;
  }

  .header-title {
    font-size: 16px;
    line-height: 1.3;
  }

  .header-sub {
    font-size: 11px;
    line-height: 1.35;
    opacity: 0.88;
  }

  .line-badge {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .score-num {
    font-size: 24px;
  }

  .map-section-title {
    font-size: 11px;
    line-height: 1.4;
  }

  .station-label {
    font-size: 12px;
    max-width: 4.75rem;
  }

  .question-text {
    font-size: 18px;
  }

  .question-hint {
    font-size: 14px;
  }

  .voice-bar {
    padding: 8px 10px;
  }

  .speed-wrap {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
  }

  .feedback {
    font-size: 13px;
    flex-wrap: wrap;
  }
}

@media (max-width: 400px) {
  .quiz-root {
    --station-gap: 24px;
    --main-pad-x: 0.5rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .option-btn {
    min-height: 56px;
    font-size: 18px;
    padding: 14px 10px;
  }

  .result-title {
    font-size: 18px;
    padding: 0 0.25rem;
    overflow-wrap: anywhere;
  }

  .result-sub {
    font-size: 13px;
  }
}

</style>
