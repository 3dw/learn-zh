<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useSpeechAvailability } from '@/composables/useSpeechAvailability'
import { getPreferredZhTwFemaleVoice, getVoicesAsync } from '@/utils/speechVoice'

type SituationLevel = 1 | 2 | 3
interface SituationQuestion {
  id: string
  level: SituationLevel
  image: string
  prompt: string
  dialogue?: string
  options: string[]
  answer: string
}

const levels = [
  { value: 1 as const, label: '等級一', description: '看圖片，選出最合適的答案。' },
  { value: 2 as const, label: '等級二', description: '看圖片與對話，選出最合適的答案。' },
  { value: 3 as const, label: '等級三', description: '看四格漫畫，選出最合適的答案。' },
]

const STORAGE_KEY = 'situation-questions'

const builtinQuestions: SituationQuestion[] = [
  {
    id: '1-1',
    level: 1,
    image: '/images/situations/level1-1.svg',
    prompt: '這個孩子看起來最可能有哪種情緒？',
    options: ['男孩很開心。', '男孩很傷心。', '女孩在生氣。', '女孩很擔心。'],
    answer: '男孩很開心。',
  },
  {
    id: '1-2',
    level: 1,
    image: '/images/situations/level1-2.svg',
    prompt: '這個情境最可能描述什麼感覺？',
    options: ['她很驚訝。', '他很生氣。', '她很無聊。', '他很緊張。'],
    answer: '她很驚訝。',
  },
  {
    id: '2-1',
    level: 2,
    image: '/images/situations/level2-1.svg',
    dialogue: '「你今天還好嗎？」「我沒事，謝謝你。」',
    prompt: '根據對話，這位孩子最可能的心情是什麼？',
    options: ['他很開心。', '他很緊張。', '他很難過。', '他很生氣。'],
    answer: '他很開心。',
  },
  {
    id: '2-2',
    level: 2,
    image: '/images/situations/level2-2.svg',
    dialogue: '「你為什麼哭了？」「我被老師罵了。」',
    prompt: '這段對話最可能對應哪種情緒？',
    options: ['他很緊張。', '他很難過。', '她很興奮。', '她很驚訝。'],
    answer: '他很難過。',
  },
  {
    id: '3-1',
    level: 3,
    image: '/images/situations/level3-1.svg',
    prompt: '這個四格漫畫最可能在描述什麼情境？',
    options: ['男孩選擇玩積木。', '女孩在騎腳踏車。', '男孩搶走了女孩的洋娃娃。', '男孩在哭泣。'],
    answer: '男孩搶走了女孩的洋娃娃。',
  },
]

function loadStoredQuestions(): SituationQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function mergeQuestions(): SituationQuestion[] {
  const stored = loadStoredQuestions()
  const storedIds = new Set(stored.map((q) => q.id))
  const builtinFiltered = builtinQuestions.filter((q) => !storedIds.has(q.id))
  return [...stored, ...builtinFiltered]
}

const questions = ref<SituationQuestion[]>(mergeQuestions())

function onVisibilityChange() {
  if (document.visibilityState !== 'visible') return
  const prevLength = currentPool.value.length
  questions.value = mergeQuestions()
  if (currentPool.value.length !== prevLength || currentQuestionIndex.value >= currentPool.value.length) {
    currentQuestionIndex.value = 0
    answerState.value = 'idle'
    selectedOption.value = null
    completed.value = false
    score.value = 0
  }
}

onMounted(() => document.addEventListener('visibilitychange', onVisibilityChange))
onUnmounted(() => document.removeEventListener('visibilitychange', onVisibilityChange))

const selectedLevel = ref<SituationLevel>(1)
const currentQuestionIndex = ref(0)
const selectedOption = ref<string | null>(null)
const answerState = ref<'idle' | 'correct' | 'wrong'>('idle')
const completed = ref(false)
const score = ref(0)
const speakingText = ref('')
const { voicePlaybackAvailable, voicePlaybackBlocked } = useSpeechAvailability()

const currentPool = computed(() => questions.value.filter((item) => item.level === selectedLevel.value))
const currentQuestion = computed(() => currentPool.value[currentQuestionIndex.value] ?? null)
const questionNumber = computed(() => currentQuestionIndex.value + 1)
const totalQuestions = computed(() => currentPool.value.length)
const hasAnswered = computed(() => answerState.value !== 'idle')

const feedbackMessage = computed(() => {
  if (!currentQuestion.value) return ''
  if (answerState.value === 'correct') return '答對了！'
  if (answerState.value === 'wrong') return `答錯了，正確答案是「${currentQuestion.value.answer}」。`
  return ''
})

const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

async function speakText(text: string) {
  if (!ttsSupported || !voicePlaybackAvailable.value || voicePlaybackBlocked.value) return
  if (!text.trim()) return

  window.speechSynthesis.cancel()
  speakingText.value = text

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-TW'
  utterance.rate = 0.95
  const voices = await getVoicesAsync()
  const preferred = getPreferredZhTwFemaleVoice(voices)
  if (preferred) {
    utterance.voice = preferred
    utterance.lang = preferred.lang
  }

  utterance.onend = () => {
    speakingText.value = ''
  }
  utterance.onerror = () => {
    speakingText.value = ''
  }

  window.speechSynthesis.speak(utterance)
}

function setLevel(level: SituationLevel) {
  selectedLevel.value = level
  currentQuestionIndex.value = 0
  selectedOption.value = null
  answerState.value = 'idle'
  completed.value = false
  score.value = 0
}

function selectOption(option: string) {
  if (!currentQuestion.value || hasAnswered.value) return
  selectedOption.value = option
  if (option === currentQuestion.value.answer) {
    answerState.value = 'correct'
    score.value += 1
  } else {
    answerState.value = 'wrong'
  }
}

function nextQuestion() {
  if (!currentQuestion.value) return
  if (currentQuestionIndex.value + 1 >= totalQuestions.value) {
    completed.value = true
    return
  }

  currentQuestionIndex.value += 1
  selectedOption.value = null
  answerState.value = 'idle'
}

function restart() {
  currentQuestionIndex.value = 0
  selectedOption.value = null
  answerState.value = 'idle'
  completed.value = false
  score.value = 0
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 pb-12 pt-6">
    <section>
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">情境識別互動題</h1>
        <p class="mt-3 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          依據圖片、對話或四格漫畫選出最適合的答案。題庫可持續擴充，請將新圖片放入
          <code class="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">public/images/situations</code>
          ，再新增題目到頁面題庫。
        </p>
      </header>

      <section class="mb-8 grid gap-3 sm:grid-cols-3">
        <button
          v-for="level in levels"
          :key="level.value"
          type="button"
          class="rounded-2xl border px-4 py-3 text-left transition focus:outline-none"
          :class="{
            'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200': selectedLevel === level.value,
            'border-stone-200 bg-white text-zinc-800 shadow-sm hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100': selectedLevel !== level.value,
          }"
          @click="setLevel(level.value)"
        >
          <div class="text-sm font-semibold">{{ level.label }}</div>
          <p class="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{{ level.description }}</p>
        </button>
      </section>

      <section class="mb-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">目前題庫</p>
            <h2 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{{ levels.find((item) => item.value === selectedLevel)?.label }}</h2>
          </div>
          <div class="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            題目：{{ questionNumber }} / {{ totalQuestions }}<br />
            分數：{{ score }}
          </div>
        </div>

        <div v-if="currentQuestion" class="space-y-6">
          <div class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div class="space-y-4">
              <p class="text-base leading-7 text-zinc-700 dark:text-zinc-200">{{ currentQuestion.prompt }}</p>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 shadow-sm transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                :disabled="!ttsSupported || voicePlaybackBlocked"
                @click="speakText(currentQuestion.prompt + (currentQuestion.dialogue ? ' ' + currentQuestion.dialogue : ''))"
              >
                {{ speakingText === currentQuestion.prompt ? '朗讀中…' : '朗讀題目' }}
              </button>
            </div>

            <div class="overflow-hidden rounded-3xl border border-stone-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
              <img
                :src="currentQuestion.image"
                :alt="currentQuestion.prompt"
                class="h-full min-h-[260px] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="option in currentQuestion.options"
              :key="option"
              type="button"
              class="rounded-2xl border px-4 py-4 text-left text-base transition focus:outline-none"
              :class="{
                'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-200': selectedOption === option && answerState === 'correct',
                'border-rose-500 bg-rose-50 text-rose-950 dark:border-rose-400 dark:bg-rose-950/50 dark:text-rose-200': selectedOption === option && answerState === 'wrong',
                'border-stone-200 bg-white text-zinc-800 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600': selectedOption !== option || answerState === 'idle',
              }"
              :disabled="hasAnswered"
              @click="selectOption(option)"
            >
              {{ option }}
            </button>
          </div>

          <div v-if="hasAnswered" class="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <p class="font-semibold text-zinc-900 dark:text-zinc-100">結果</p>
            <p class="mt-2 text-zinc-700 dark:text-zinc-200">{{ feedbackMessage }}</p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              class="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!hasAnswered"
              @click="completed ? restart() : nextQuestion()"
            >
              {{ completed ? '已完成！再玩一次' : currentQuestionIndex + 1 >= totalQuestions ? '完成測驗' : '下一題' }}
            </button>
            <button
              type="button"
              class="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-stone-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              @click="restart"
            >
              重新開始
            </button>
          </div>
        </div>

        <div v-else class="rounded-3xl border border-stone-200 bg-stone-50 p-6 text-center text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
          目前這個等級尚無題目。請在題庫中新增題目後再試一次。
        </div>
      </section>

      <section class="rounded-3xl border border-stone-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        <h2 class="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">擴充題庫提示</h2>
        <ul class="space-y-2 list-disc pl-5">
          <li>將新圖片放到 <code class="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">public/images/situations</code>。</li>
          <li>在本頁面頂端的 <code class="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">questions</code> 陣列新增題目物件。</li>
          <li>每題包含：`level`、`image`、`prompt`、`options`、`answer`。</li>
          <li>未來可直接新增題目，不需要改變大部分的頁面邏輯。</li>
        </ul>
      </section>
    </section>
  </main>
</template>
