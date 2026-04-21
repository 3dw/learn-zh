<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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

const STORAGE_KEY = 'situation-questions'

const levels: { value: SituationLevel; label: string; description: string }[] = [
  { value: 1, label: '等級一', description: '看圖片，選出最合適的答案。' },
  { value: 2, label: '等級二', description: '看圖片與對話，選出最合適的答案。' },
  { value: 3, label: '等級三', description: '看四格漫畫，選出最合適的答案。' },
]

// ── 持久化 ──────────────────────────────────────────────
function loadQuestions(): SituationQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQuestions(list: SituationQuestion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const questions = ref<SituationQuestion[]>(loadQuestions())
watch(questions, (val) => saveQuestions(val), { deep: true })

// ── 等級選擇 ─────────────────────────────────────────────
const selectedLevel = ref<SituationLevel>(1)

const filteredQuestions = computed(() =>
  questions.value.filter((q) => q.level === selectedLevel.value),
)

// ── 表單狀態 ─────────────────────────────────────────────
const emptyForm = (): Omit<SituationQuestion, 'id'> => ({
  level: selectedLevel.value,
  image: '',
  prompt: '',
  dialogue: '',
  options: ['', ''],
  answer: '',
})

const form = ref(emptyForm())
const editingId = ref<string | null>(null)
const imagePreview = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const formError = ref('')

watch(selectedLevel, () => {
  resetForm()
})

// ── 圖片上傳 ─────────────────────────────────────────────
function triggerUpload() {
  fileInputRef.value?.click()
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    form.value.image = result
    imagePreview.value = result
  }
  reader.readAsDataURL(file)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function removeImage() {
  form.value.image = ''
  imagePreview.value = ''
}

// ── 選項管理 ─────────────────────────────────────────────
function addOption() {
  form.value.options.push('')
}

function syncAnswer(index: number) {
  if (form.value.answer !== '' && form.value.answer === form.value.options[index]) {
    form.value.answer = form.value.options[index]
  }
}

function removeOption(index: number) {
  if (form.value.options.length <= 2) return
  const removed = form.value.options[index]
  if (form.value.answer === removed) form.value.answer = ''
  form.value.options.splice(index, 1)
}

// ── 儲存 / 編輯 / 刪除 ───────────────────────────────────
function validate(): boolean {
  formError.value = ''
  if (!form.value.image) { formError.value = '請上傳圖片。'; return false }
  if (!form.value.prompt.trim()) { formError.value = '請填寫題目說明。'; return false }
  if (form.value.options.some((o) => !o.trim())) { formError.value = '選項不可為空白。'; return false }
  if (!form.value.answer) { formError.value = '請選擇正確答案。'; return false }
  return true
}

function saveQuestion() {
  if (!validate()) return

  if (editingId.value) {
    const idx = questions.value.findIndex((q) => q.id === editingId.value)
    if (idx !== -1) {
      questions.value[idx] = {
        ...form.value,
        id: editingId.value,
        level: selectedLevel.value,
        dialogue: selectedLevel.value === 2 ? form.value.dialogue : undefined,
      }
    }
  } else {
    questions.value.push({
      ...form.value,
      id: `${selectedLevel.value}-${Date.now()}`,
      level: selectedLevel.value,
      dialogue: selectedLevel.value === 2 ? form.value.dialogue : undefined,
    })
  }

  resetForm()
}

function editQuestion(q: SituationQuestion) {
  editingId.value = q.id
  form.value = {
    level: q.level,
    image: q.image,
    prompt: q.prompt,
    dialogue: q.dialogue ?? '',
    options: [...q.options],
    answer: q.answer,
  }
  imagePreview.value = q.image
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function deleteQuestion(id: string) {
  questions.value = questions.value.filter((q) => q.id !== id)
  if (editingId.value === id) resetForm()
}

function resetForm() {
  form.value = emptyForm()
  imagePreview.value = ''
  editingId.value = null
  formError.value = ''
}

// ── JSON 匯出 ─────────────────────────────────────────────
function exportJson() {
  const blob = new Blob([JSON.stringify(questions.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'situation-questions.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 pb-16 pt-6">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">編輯題目</h1>
      <p class="mt-2 text-base leading-7 text-zinc-500 dark:text-zinc-400">
        新增或修改情境識別題庫，資料儲存於瀏覽器 localStorage。
      </p>
    </header>

    <!-- 等級切換 -->
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
        @click="selectedLevel = level.value"
      >
        <div class="text-sm font-semibold">{{ level.label }}</div>
        <p class="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{{ level.description }}</p>
      </button>
    </section>

    <!-- 新增 / 編輯表單 -->
    <section class="mb-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
      <h2 class="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {{ editingId ? '編輯題目' : `新增題目（${levels.find(l => l.value === selectedLevel)?.label}）` }}
      </h2>

      <div class="space-y-6">

        <!-- 圖片上傳 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">圖片</label>
          <div
            v-if="imagePreview"
            class="relative mb-3 overflow-hidden rounded-2xl border border-stone-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <img :src="imagePreview" alt="預覽圖片" class="max-h-64 w-full object-contain" />
            <button
              type="button"
              class="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-rose-600 shadow hover:bg-white dark:bg-zinc-900/90 dark:text-rose-400"
              @click="removeImage"
            >
              移除
            </button>
          </div>
          <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-800 shadow-sm transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            @click="triggerUpload"
          >
            上傳圖片
          </button>
        </div>

        <!-- 題目說明 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">題目說明</label>
          <input
            v-model="form.prompt"
            type="text"
            placeholder="例：這個孩子看起來最可能有哪種情緒？"
            class="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <!-- 對話（等級二才顯示） -->
        <div v-if="selectedLevel === 2">
          <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">對話內容</label>
          <textarea
            v-model="form.dialogue"
            rows="3"
            placeholder="例：「你今天還好嗎？」「我沒事，謝謝你。」"
            class="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <!-- 選項 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            選項
            <span class="ml-1 font-normal text-zinc-400">（點選選項左側圓圈設為正確答案）</span>
          </label>
          <div class="space-y-2">
            <div
              v-for="(option, index) in form.options"
              :key="index"
              class="flex items-center gap-2"
            >
              <!-- 正確答案選擇 -->
              <button
                type="button"
                class="h-5 w-5 shrink-0 rounded-full border-2 transition"
                :class="form.answer === option && option.trim()
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'"
                :title="'設為正確答案'"
                @click="form.answer = option"
              />
              <input
                v-model="form.options[index]"
                type="text"
                :placeholder="'選項 ' + (index + 1)"
                class="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                @input="syncAnswer(index)"
              />
              <button
                type="button"
                :disabled="form.options.length <= 2"
                class="rounded-full p-1.5 text-zinc-400 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                title="刪除此選項"
                @click="removeOption(index)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <button
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-600 dark:text-zinc-400"
            @click="addOption"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            新增選項
          </button>
        </div>

        <!-- 錯誤訊息 -->
        <p v-if="formError" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {{ formError }}
        </p>

        <!-- 操作按鈕 -->
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            @click="saveQuestion"
          >
            {{ editingId ? '儲存修改' : '新增題目' }}
          </button>
          <button
            v-if="editingId"
            type="button"
            class="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-stone-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            @click="resetForm"
          >
            取消編輯
          </button>
        </div>
      </div>
    </section>

    <!-- 現有題目列表 -->
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {{ levels.find(l => l.value === selectedLevel)?.label }} 題目列表
          <span class="ml-2 text-sm font-normal text-zinc-400">（{{ filteredQuestions.length }} 題）</span>
        </h2>
        <button
          v-if="questions.length > 0"
          type="button"
          class="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-stone-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          @click="exportJson"
        >
          匯出 JSON
        </button>
      </div>

      <div v-if="filteredQuestions.length === 0" class="rounded-3xl border border-stone-200 bg-stone-50 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
        目前沒有題目，請從上方表單新增。
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="q in filteredQuestions"
          :key="q.id"
          class="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <div class="grid gap-4 p-5 sm:grid-cols-[1fr_160px]">
            <div class="space-y-3">
              <p class="text-sm font-medium text-zinc-800 dark:text-zinc-100">{{ q.prompt }}</p>
              <div v-if="q.dialogue" class="rounded-2xl bg-stone-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {{ q.dialogue }}
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="opt in q.options"
                  :key="opt"
                  class="rounded-full px-3 py-1 text-xs"
                  :class="opt === q.answer
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'"
                >
                  {{ opt === q.answer ? '✓ ' : '' }}{{ opt }}
                </span>
              </div>
            </div>
            <div v-if="q.image" class="overflow-hidden rounded-2xl border border-stone-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
              <img :src="q.image" :alt="q.prompt" class="h-28 w-full object-cover" />
            </div>
          </div>

          <div class="flex gap-2 border-t border-stone-100 px-5 py-3 dark:border-zinc-800">
            <button
              type="button"
              class="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"
              @click="editQuestion(q)"
            >
              編輯
            </button>
            <button
              type="button"
              class="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-medium text-rose-600 transition hover:border-rose-400 dark:border-rose-800 dark:text-rose-400"
              @click="deleteQuestion(q.id)"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
