<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpeechAvailability } from '@/composables/useSpeechAvailability'
import { getPreferredZhTwFemaleVoice, getVoicesAsync } from '@/utils/speechVoice'

type Station = { id: string; name: string; pronunciation?: string; hint: string }
type MetroLine = {
  key: string
  badge: string
  title: string
  subtitle: string
  theme: {
    color: string
    colorDark: string
    colorLight: string
    colorMid: string
  }
  stations: Station[]
}

const BANNAN_STATIONS: Station[] = [
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

const TAMSUI_STATIONS: Station[] = [
  { id: 'R28', name: '淡水', hint: '紅線北端站，淡水老街與河岸景點集中地' },
  { id: 'R27', name: '紅樹林', hint: '可轉乘淡海輕軌，鄰近紅樹林自然保護區' },
  { id: 'R26', name: '竹圍', hint: '淡水河北岸住宅區，通勤族常用站' },
  { id: 'R25', name: '關渡', hint: '關渡宮與關渡平原周邊，亦鄰近關渡自然公園' },
  { id: 'R24', name: '忠義', hint: '北投區北側，站體高架、周邊較寧靜' },
  { id: 'R23', name: '復興崗', hint: '鄰近國防大學與復興崗營區' },
  { id: 'R22', name: '北投', hint: '可轉乘新北投支線，溫泉區入口站' },
  { id: 'R21', name: '奇岩', hint: '北投生活圈車站，靠近奇岩重劃區' },
  { id: 'R20', name: '唭哩岸', hint: '石牌與北投交界，附近有傳統市場與商圈' },
  { id: 'R19', name: '石牌', hint: '天母醫療與校園生活圈重要站點' },
  { id: 'R18', name: '明德', hint: '北投南側住宅區，通勤站點' },
  { id: 'R17', name: '芝山', hint: '天母門戶，鄰近百貨與學校' },
  { id: 'R16', name: '士林', hint: '士林夜市與商圈主要聯外車站' },
  { id: 'R15', name: '劍潭', hint: '可前往士林夜市與劍潭山步道' },
  { id: 'R14', name: '圓山', hint: '花博公園與美術館周邊站點' },
  { id: 'R13', name: '民權西路', hint: '紅線與橘線交會，往返大同與中山區便利' },
  { id: 'R12', name: '雙連', hint: '中山北路沿線，鄰近寧夏夜市' },
  { id: 'R11', name: '中山', hint: '雙線交會商圈站，百貨與文創聚集' },
  { id: 'R10', name: '台北車站', hint: '北市交通樞紐，台鐵高鐵捷運交會' },
  { id: 'R09', name: '台大醫院', hint: '中正區核心，醫療與公署機關集中' },
  { id: 'R08', name: '中正紀念堂', hint: '紅線綠線交會，國家劇院音樂廳周邊' },
  { id: 'R07', name: '東門', hint: '永康商圈、紅線橘線交會站' },
  { id: 'R06', name: '大安森林公園', hint: '鄰近大安森林公園綠地' },
  { id: 'R05', name: '大安', hint: '紅線與文湖線交會，轉乘方便' },
  { id: 'R04', name: '信義安和', hint: '信義路商辦區與住宅區交會' },
  { id: 'R03', name: '台北101/世貿', hint: '信義計畫區核心，台北 101 所在地' },
  { id: 'R02', name: '象山', hint: '紅線南端站，登象山看夜景熱門入口' },
]

const CIRCULAR_STATIONS: Station[] = [
  { id: 'Y07', name: '大坪林', hint: '新店區，可轉乘松山新店線，環狀線南端起點' },
  { id: 'Y08', name: '十四張', hint: '新店與中和交界，鄰近十四張重劃區' },
  { id: 'Y09', name: '秀朗橋', hint: '跨越新店溪，連結新店與中和兩岸' },
  { id: 'Y10', name: '景平', hint: '中和區景平路商圈，生活機能便利' },
  { id: 'Y11', name: '景安', hint: '可轉乘中和新蘆線，中和區重要轉乘站' },
  { id: 'Y12', name: '中和', pronunciation: '中河', hint: '中和區行政中心附近，鄰近四號公園' },
  { id: 'Y13', name: '橋和', pronunciation: '橋河', hint: '中和與板橋交界，橋和路沿線住宅區' },
  { id: 'Y14', name: '中原', hint: '板橋中原路周邊，新北市住宅密集區' },
  { id: 'Y15', name: '板新', hint: '板橋新站區，新北市行政中心附近' },
  { id: 'Y16', name: '板橋', hint: '可轉乘板南線與台鐵高鐵，板橋最大交通樞紐' },
  { id: 'Y17', name: '新埔民生', hint: '可轉乘板南線新埔站，板橋東側住宅區' },
  { id: 'Y18', name: '頭前庄', hint: '可轉乘中和新蘆線，新莊與板橋交界' },
  { id: 'Y19', name: '幸福', hint: '新莊區幸福路沿線，住宅與商業混合區' },
  { id: 'Y20', name: '新北產業園區', hint: '可轉乘機場捷運，環狀線北端終點站' },
]

const METRO_LINES: MetroLine[] = [
  {
    key: 'bannan',
    badge: 'BL',
    title: '板南線 站名學習',
    subtitle: 'Bannan Line · 認識 23 個車站',
    theme: {
      color: '#0070bd',
      colorDark: '#004f8a',
      colorLight: '#e6f3fb',
      colorMid: '#b5d4f4',
    },
    stations: BANNAN_STATIONS,
  },
  {
    key: 'tamshui',
    badge: 'R',
    title: '淡水線 站名學習',
    subtitle: 'Tamsui-Xinyi Line · 認識 27 個車站',
    theme: {
      color: '#cb2c30',
      colorDark: '#9b1f25',
      colorLight: '#fdeced',
      colorMid: '#f7c5c9',
    },
    stations: TAMSUI_STATIONS,
  },
  {
    key: 'circular',
    badge: 'Y',
    title: '環狀線 站名學習',
    subtitle: 'Circular Line · 認識 14 個車站',
    theme: {
      color: '#c8a400',
      colorDark: '#9a7d00',
      colorLight: '#fdf8e1',
      colorMid: '#f5e08a',
    },
    stations: CIRCULAR_STATIONS,
  },
]

const TOTAL_Q = 15

const OPT_PALETTES = [
	'bg-amber-100 border-amber-300 text-amber-950 hover:not(:disabled):bg-amber-200 hover:not(:disabled):border-amber-400',
	'bg-emerald-100 border-emerald-400 text-emerald-950 hover:not(:disabled):bg-emerald-200 hover:not(:disabled):border-emerald-500',
	'bg-sky-100 border-sky-400 text-sky-950 hover:not(:disabled):bg-sky-200 hover:not(:disabled):border-sky-500',
	'bg-rose-100 border-rose-300 text-rose-950 hover:not(:disabled):bg-rose-200 hover:not(:disabled):border-rose-400',
] as const

const selectedLineKey = ref<string>('bannan')
const route = useRoute()
const router = useRouter()
const currentLine = computed(
  () => METRO_LINES.find((line) => line.key === selectedLineKey.value) ?? METRO_LINES[0]!,
)
const currentStations = computed(() => currentLine.value.stations)
const questionCount = computed(() => Math.min(TOTAL_Q, currentStations.value.length))
const lineThemeStyle = computed<Record<string, string>>(() => ({
  '--blue': currentLine.value.theme.color,
  '--blue-dark': currentLine.value.theme.colorDark,
  '--blue-light': currentLine.value.theme.colorLight,
  '--blue-mid': currentLine.value.theme.colorMid,
}))

function normalizeLineKey(value: unknown): 'bannan' | 'tamshui' | 'circular' {
  if (value === 'tamshui') return 'tamshui'
  if (value === 'circular') return 'circular'
  return 'bannan'
}

function lineKeyFromRoutePath(path: string): 'bannan' | 'tamshui' | 'circular' {
  if (path.startsWith('/tamshui-line-quiz')) return 'tamshui'
  if (path.startsWith('/circular-line-quiz')) return 'circular'
  if (path.startsWith('/line-quiz/')) {
    const seg = path.split('/')[2] ?? ''
    return normalizeLineKey(seg)
  }
  return 'bannan'
}

function pathForLine(key: 'bannan' | 'tamshui' | 'circular') {
  if (route.path.startsWith('/line-quiz/')) return `/line-quiz/${key}`
  if (key === 'tamshui') return '/tamshui-line-quiz'
  if (key === 'circular') return '/circular-line-quiz'
  return '/bannan-line-quiz'
}

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
  return shuffle([...currentStations.value]).slice(0, questionCount.value)
}

function getOptions(target: Station): string[] {
  const others = currentStations.value.filter((s) => s.id !== target.id)
  const shuffled = shuffle(others)
    .slice(0, 3)
    .map((s) => s.name)
  return shuffle([target.name, ...shuffled])
}

function shuffleOptionPaletteIndices(): number[] {
	return shuffle([0, 1, 2, 3])
}

const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
const voiceEnabled = ref(false)
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
const optionPaletteByIndex = ref<number[]>(shuffleOptionPaletteIndices())

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
const { voicePlaybackAvailable, voicePlaybackBlocked } = useSpeechAvailability()

async function refreshZhVoice() {
  if (!ttsSupported) return
  const voices = await getVoicesAsync()
  zhVoice.value = getPreferredZhTwFemaleVoice(voices)
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
  if (!ttsSupported || !voicePlaybackAvailable.value || !voiceEnabled.value || !zhVoice.value) {
    onEnd?.()
    return
  }
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(attachUtterance(text, speechRate.value, onEnd))
}

function getSpokenStationName(name: string): string {
  const station = currentStations.value.find((s) => s.name === name)
  return station?.pronunciation?.trim() || station?.name || name
}

async function speakOptionsSequentially() {
  if (!ttsSupported || !voicePlaybackAvailable.value || !zhVoice.value || current.value >= pool.value.length) return
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
    const u = attachUtterance(getSpokenStationName(opts[i]!), speechRate.value, () => {
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
  if (!ttsSupported || !voicePlaybackAvailable.value || !voiceEnabled.value || !zhVoice.value) return
  labelFlashName.value = name
  window.setTimeout(() => {
    if (labelFlashName.value === name) labelFlashName.value = null
  }, 1000)
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(attachUtterance(getSpokenStationName(name), speechRate.value))
}

function speakFeedback(isRight: boolean, name: string) {
  if (!voicePlaybackAvailable.value || !voiceEnabled.value || !ttsSupported) return
  const spokenName = getSpokenStationName(name)
  const msg = isRight ? `答對了！這站是${spokenName}` : `答錯了，正確答案是${spokenName}`
  speakText(msg)
}

const lineMapSlice = computed(() => {
  const q = pool.value[current.value]
  if (!q) return [] as { station: Station; globalIdx: number }[]
  const targetIdx = currentStations.value.findIndex((s) => s.id === q.id)
  const start = Math.max(0, targetIdx - 2)
  const end = Math.min(currentStations.value.length - 1, targetIdx + 2)
  return currentStations.value.slice(start, end + 1).map((station, i) => ({
    station,
    globalIdx: start + i,
  }))
})

const progressPct = computed(() =>
  Math.min(100, Math.round((current.value / questionCount.value) * 100)),
)

const showQuiz = computed(
  () => current.value < questionCount.value && pool.value[current.value] != null,
)

const resultPercent = computed(() =>
  Math.round((score.value / questionCount.value) * 100),
)

const resultMessage = computed(() => {
  const pct = resultPercent.value
  const s = score.value
  if (s === questionCount.value) return '完美！全部答對！🎉'
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
  optionPaletteByIndex.value = shuffleOptionPaletteIndices()
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
  if (current.value >= questionCount.value) {
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
	const base: (string | Record<string, boolean>)[] = [
		'rounded-2xl border-[1.5px] px-3 py-5 text-center font-sans text-[22px] font-bold leading-snug transition min-h-[56px] min-[401px]:min-h-[76px]',
	]
	if (!answered.value) {
		const pi = optionPaletteByIndex.value[idx] ?? 0
		base.push(OPT_PALETTES[pi % OPT_PALETTES.length]!)
		if (speakingOptionIndex.value === idx) base.push('quiz-opt-speaking')
		base.push(
			'hover:not(:disabled):-translate-y-px hover:not(:disabled):border-[var(--blue)] hover:not(:disabled):bg-[var(--blue-light)] hover:not(:disabled):text-[var(--blue-dark)]',
		)
		return base
	}
	const q = pool.value[current.value]
	if (!q) return base
	const correctName = q.name
	const wasRight = history.value[current.value]?.correct
	if (label === correctName) {
		if (!wasRight) {
			base.push('border-emerald-600 bg-emerald-100 text-emerald-800 opacity-55')
		} else {
			base.push('border-emerald-600 bg-emerald-50 text-emerald-800')
		}
	} else if (wasRight === false && label === wrongPick.value) {
		base.push('border-red-600 bg-red-50 text-red-800')
	} else {
		base.push(
			'cursor-default border-slate-200 bg-slate-100 text-zinc-500 opacity-45 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
		)
	}
	return base
}

watch(voiceEnabled, (on) => {
  if (!on) stopSpeech()
})

watch(voicePlaybackBlocked, (blocked) => {
  if (blocked) {
    voiceEnabled.value = false
    stopSpeech()
    return
  }
  voiceEnabled.value = true
})

watch(selectedLineKey, () => {
  const key = normalizeLineKey(selectedLineKey.value)
  if (selectedLineKey.value !== key) selectedLineKey.value = key
  const nextPath = pathForLine(key)
  if (route.path !== nextPath) {
    void router.replace(nextPath)
  }
  initGame()
})

watch(
  () => route.path,
  (path) => {
    const key = lineKeyFromRoutePath(path)
    if (selectedLineKey.value !== key) {
      selectedLineKey.value = key
    }
  },
)

onMounted(() => {
  const initialLineKey = lineKeyFromRoutePath(route.path)
  const shouldInitImmediately = selectedLineKey.value === initialLineKey
  selectedLineKey.value = initialLineKey
  void refreshZhVoice()
  if (ttsSupported) {
    window.speechSynthesis.addEventListener('voiceschanged', refreshZhVoice)
  }
  if (voicePlaybackBlocked.value) {
    voiceEnabled.value = false
  }
  initFireworks()
  if (shouldInitImmediately) initGame()
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
	<div
		class="box-border flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden bg-slate-100 font-sans text-zinc-900 antialiased [padding-left:env(safe-area-inset-left,0)] [padding-right:env(safe-area-inset-right,0)] dark:bg-zinc-950 dark:text-zinc-100"
		:style="lineThemeStyle"
	>
		<canvas
			id="fireworks-canvas"
			ref="fireworksCanvas"
			aria-hidden="true"
			class="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
		/>

		<div
			class="flex flex-wrap items-center gap-3.5 bg-[var(--blue)] px-4 py-3 text-white shadow-[0_2px_12px_rgba(0,112,189,0.25)] sm:gap-3.5 sm:px-6 sm:py-3.5"
		>
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-[var(--blue)] sm:h-10 sm:w-10 sm:text-[22px]"
				style="font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif"
			>
				{{ currentLine.badge }}
			</div>
			<div class="min-w-0 flex-1 basis-[140px]">
				<div class="text-base font-bold leading-snug sm:text-lg">{{ currentLine.title }}</div>
				<div class="mt-0.5 text-[11px] opacity-85 leading-snug sm:text-[13px]">
					{{ currentLine.subtitle }}
				</div>
			</div>
			<div class="ml-auto shrink-0 text-right">
				<div
					class="text-2xl font-bold leading-none sm:text-[28px]"
					style="font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif"
				>
					{{ score }}
				</div>
				<div class="text-[11px] opacity-75">答對題數</div>
			</div>
		</div>
		<div class="h-1.5 bg-[var(--blue-dark)]">
			<div
				class="h-1.5 bg-white transition-[width] duration-300 ease-out"
				:style="{ width: progressPct + '%' }"
			/>
		</div>

		<div v-if="showQuiz" class="mx-auto box-border w-full min-w-0 max-w-[720px] px-3 pb-8 pt-5 sm:px-4">
			<div class="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-[13px] dark:text-zinc-400">
				<span>路線：</span>
				<select
					v-model="selectedLineKey"
					aria-label="選擇捷運路線"
					class="max-w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-zinc-900 sm:max-w-xs sm:text-[13px] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
				>
					<option v-for="line in METRO_LINES" :key="line.key" :value="line.key">
						{{ line.title }}
					</option>
				</select>
			</div>
			<div
				v-if="!ttsSupported || voicePlaybackBlocked"
				class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-slate-600 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
			>
				<span v-if="!ttsSupported">此瀏覽器不支援語音播報功能，建議使用 Chrome 或 Edge。</span>
				<span v-else>目前沒有可用的華語語音，語音題目與站名播放已停用。</span>
			</div>
			<div
				v-else
				class="mb-4 flex max-w-full flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:gap-2.5 sm:px-3.5 sm:text-[13px] dark:border-zinc-600 dark:bg-zinc-900"
			>
				<label
					class="flex cursor-pointer select-none items-center gap-1.5 text-slate-500 dark:text-zinc-400"
					:class="voiceEnabled ? 'font-medium text-[var(--blue-dark)] dark:text-sky-200' : ''"
				>
					<input
						v-model="voiceEnabled"
						type="checkbox"
						class="h-[15px] w-[15px] cursor-pointer accent-[var(--blue)]"
					/>
					語音播報
				</label>
				<div class="hidden h-5 w-px shrink-0 bg-slate-200 sm:block dark:bg-zinc-600" />
				<button
					type="button"
					class="flex items-center gap-1 rounded-lg border border-[var(--blue-mid)] bg-[var(--blue-light)] px-3 py-1 text-[13px] font-medium text-[var(--blue-dark)] transition hover:bg-[var(--blue-mid)] disabled:cursor-default disabled:opacity-40 dark:text-sky-950"
					:class="replayBusy ? 'border-[var(--blue-dark)] bg-[var(--blue)] text-white' : ''"
					:disabled="replayBusy || !voiceEnabled"
					@click="speakOptionsSequentially"
				>
					<span class="text-[15px] leading-none">🔈</span>
					再聽一次
				</button>
				<div class="flex w-full items-center gap-1.5 text-[12px] text-slate-500 sm:ml-auto sm:w-auto dark:text-zinc-400">
					速度：
					<select
						v-model.number="speechRate"
						class="cursor-pointer rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[12px] text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
					>
						<option :value="0.6">慢速</option>
						<option :value="0.85">正常</option>
						<option :value="1.1">快速</option>
					</select>
				</div>
			</div>

			<div
				class="mb-4 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 pb-4 pt-5 sm:px-3 dark:border-zinc-600 dark:bg-zinc-900"
			>
				<div
					class="mb-4 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs dark:text-zinc-400"
				>
					{{ currentLine.title }}地圖 — 找出 ？ 是哪一站
				</div>
				<div
					ref="mapScrollEl"
					class="max-w-full overflow-x-auto overflow-y-hidden pb-2 [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain]"
				>
					<div
						class="line-map flex w-max min-w-max items-stretch gap-x-[44px] px-3 max-[640px]:gap-x-[30px] max-[400px]:gap-x-6"
					>
						<div
							v-for="({ station: s, globalIdx }, i) in lineMapSlice"
							:key="s.id"
							class="station-wrap flex shrink-0 flex-col items-center"
						>
							<div v-if="s.id === pool[current]!.id" class="station-label hidden-label">
								<span>？</span>
							</div>
							<button
								v-else
								type="button"
								class="station-label clickable disabled:cursor-not-allowed disabled:opacity-45"
								:title="'點我聽讀：' + s.name"
								:class="{ 'label-speaking': labelFlashName === s.name }"
								:disabled="voicePlaybackBlocked || !voiceEnabled"
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
											(i === lineMapSlice.length - 1 &&
												globalIdx === currentStations.length - 1),
										target: s.id === pool[current]!.id,
									}"
								/>
							</div>
							<div
								class="station-num mt-1.5 whitespace-nowrap text-[10px] font-semibold text-[var(--blue)] dark:text-sky-300"
								style="font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif"
							>
								{{ s.id }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				class="mb-4 rounded-xl border border-[var(--blue-mid)] bg-[var(--blue-light)] px-4 py-4 dark:border-sky-800 dark:bg-sky-950/30"
			>
				<div class="text-lg font-bold leading-normal text-[var(--blue-dark)] sm:text-[22px] dark:text-sky-100">
					這個站叫什麼名字？
				</div>
				<div
					class="mt-2 break-words text-sm leading-relaxed text-[var(--blue-dark)] opacity-80 sm:text-base dark:text-sky-100/90"
				>
					提示：{{ pool[current]!.hint }}
				</div>
			</div>

			<div class="mb-4 grid grid-cols-1 gap-2 min-[401px]:grid-cols-2 min-[401px]:gap-2.5">
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

			<div
				v-if="feedbackKind === 'correct'"
				class="mb-4 flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
			>
				<span class="shrink-0 text-xl">✓</span>
				{{ feedbackText }}
			</div>
			<div
				v-else-if="feedbackKind === 'wrong'"
				class="mb-4 flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
			>
				<span class="shrink-0 text-xl">✗</span>
				{{ feedbackText }}
			</div>

			<button
				v-if="answered"
				type="button"
				class="w-full cursor-pointer rounded-xl border-0 bg-[var(--blue)] py-3.5 text-[15px] font-bold tracking-wide text-white transition hover:bg-[var(--blue-dark)] active:scale-[0.98] dark:text-white"
				@click="nextQuestion"
			>
				{{ current < questionCount - 1 ? '下一題 →' : '查看結果 →' }}
			</button>
		</div>

		<div v-else class="mx-auto box-border w-full min-w-0 max-w-[720px] px-3 pb-8 pt-5 sm:px-4">
			<div class="px-2 pb-4 pt-8 text-center">
				<div
					class="mx-auto mb-5 flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-[var(--blue)] text-white shadow-[0_4px_24px_rgba(0,112,189,0.3)] dark:shadow-lg"
				>
					<div
						class="text-[40px] font-bold leading-none"
						style="font-family: 'Barlow Condensed', ui-sans-serif, system-ui, sans-serif"
					>
						{{ score }}
					</div>
					<div class="text-[13px] opacity-80">/ {{ questionCount }} 題</div>
				</div>
				<div class="mb-2 text-lg font-bold sm:text-[22px]">{{ resultMessage }}</div>
				<div class="mb-7 text-sm text-slate-500 dark:text-zinc-400">
					答對率 {{ resultPercent }}%，共考了 {{ questionCount }} 站
				</div>
				<div
					class="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-left dark:border-zinc-600 dark:bg-zinc-900"
				>
					<div class="mb-2.5 text-[13px] text-slate-500 dark:text-zinc-400">本次答題紀錄</div>
					<div
						v-for="(h, i) in history"
						:key="i"
						class="flex flex-wrap items-center gap-2 border-t border-slate-200 py-1.5 text-[13px] first:border-t-0 dark:border-zinc-700"
					>
						<div
							class="h-2 w-2 shrink-0 rounded-full"
							:class="h.correct ? 'bg-emerald-600' : 'bg-red-600'"
						/>
						<span class="min-w-9 text-xs text-slate-500 dark:text-zinc-400">{{ pool[i]!.id }}</span>
						<span
							class="min-w-0 flex-1 basis-[120px] font-medium [overflow-wrap:anywhere] dark:text-zinc-100"
						>
							{{ h.station }}
						</span>
						<span
							class="ml-auto text-xs"
							:class="h.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
						>
							{{ h.correct ? '✓ 答對' : '✗ 答錯' }}
						</span>
					</div>
				</div>
				<button
					type="button"
					class="cursor-pointer rounded-xl border-0 bg-[var(--blue)] px-10 py-3.5 text-[15px] font-bold text-white transition hover:bg-[var(--blue-dark)]"
					@click="initGame"
				>
					再挑戰一次
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.station-wrap {
	--station-size: 12px;
	--line-w: 6px;
}

.station-label {
	min-height: 40px;
	height: auto;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	font-size: 13px;
	font-weight: 500;
	color: inherit;
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

.quiz-opt-speaking {
	animation: optHighlight 0.5s ease-in-out 2;
	outline: 3px solid rgba(0, 0, 0, 0.18);
	outline-offset: 2px;
}

@media (max-width: 640px) {
	.station-label {
		font-size: 12px;
		max-width: 4.75rem;
	}
}
</style>
