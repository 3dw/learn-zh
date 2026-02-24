<template>
  <div class="custom-page">
    <div class="custom-container">
      <h1 class="title">自訂朗讀 Demo</h1>

      <section class="section-card">
        <div class="section-title">1) 輸入長篇文字</div>
        <p class="section-help">
          使用說明：將想朗讀的內容貼到下方，可輸入多段文字。系統會保留換行，朗讀時依目前內容播放。
        </p>
        <textarea
          v-model="rawText"
          class="textarea-input"
          placeholder="請輸入要朗讀的內容..."
          rows="4"
        />
      </section>

      <section class="section-card">
        <div class="section-title">2) 輸入同音字對照（CSV）</div>
        <p class="section-help">
          使用說明：每行一組，格式為「原字詞,替換字詞」。例如：
          <code>教,叫</code>、<code>為人子,危人子</code>。空白行會自動忽略。
        </p>
        <textarea
          v-model="rawCsv"
          class="textarea-input"
          placeholder="教,叫&#10;為人子,危人子"
          rows="3"
        />
        <div v-if="csvErrors.length > 0" class="banner-error">
          <div v-for="error in csvErrors" :key="error">{{ error }}</div>
        </div>
      </section>

      <section class="section-card">
        <div class="section-title">3) 檢查替換後內容</div>
        <p class="section-help">
          使用說明：這裡會顯示朗讀前實際送出的文字，方便先確認同音字替換是否符合預期。
        </p>
        <textarea v-model="speechText" class="textarea-input" readonly rows="4" />
      </section>

      <section class="section-card">
        <div class="section-title">4) 按鍵朗讀（台灣口音優先）</div>
        <p class="section-help">
          使用說明：按「開始朗讀」播放，按「停止朗讀」可立即停止。語音會優先使用 zh-TW 與台灣相關語音。
        </p>
        <div class="button-row">
          <button
            type="button"
            :class="['btn', isSpeaking ? 'btn-stop' : 'btn-primary']"
            @click="toggleSpeech"
          >
            {{ isSpeaking ? '停止朗讀' : '開始朗讀' }}
          </button>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ZH_TW_PREFERRED_KEYWORDS, getPreferredVoice } from '@/utils/speechVoice'

const rawText = ref(`人之初，性本善，性相近，習相遠。
苟不教，性乃遷，教之道，貴以專。`)

const rawCsv = ref(`教,叫
為人子,危人子`)

const isSpeaking = ref(false)

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const csvParseResult = computed(() => {
  const map: Record<string, string> = {}
  const errors: string[] = []
  const lines = rawCsv.value.split(/\r?\n/)

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) return

    const normalized = trimmed.replace(/，/g, ',')
    const firstCommaIndex = normalized.indexOf(',')

    if (firstCommaIndex <= 0 || firstCommaIndex === normalized.length - 1) {
      errors.push(`第 ${index + 1} 行格式錯誤，請使用「原字詞,替換字詞」`)
      return
    }

    const original = normalized.slice(0, firstCommaIndex).trim()
    const replacement = normalized.slice(firstCommaIndex + 1).trim()

    if (!original || !replacement) {
      errors.push(`第 ${index + 1} 行內容不可為空`)
      return
    }

    map[original] = replacement
  })

  return { map, errors }
})

const csvErrors = computed(() => csvParseResult.value.errors)

const speechText = computed(() => {
  let processedText = rawText.value

  Object.entries(csvParseResult.value.map).forEach(([original, replacement]) => {
    processedText = processedText.replace(new RegExp(escapeRegExp(original), 'g'), replacement)
  })

  return processedText
})

const statusText = computed(() => {
  if (csvErrors.value.length > 0) return 'CSV 有格式錯誤，仍可朗讀原始可解析項目。'
  return isSpeaking.value ? '朗讀中...' : '待命中'
})

const createUtterance = () => {
  const utterance = new SpeechSynthesisUtterance(speechText.value)
  utterance.lang = 'zh-TW'
  utterance.rate = 0.9

  const preferredVoice = getPreferredVoice('zh-TW', ZH_TW_PREFERRED_KEYWORDS)
  if (preferredVoice) {
    utterance.voice = preferredVoice
    utterance.lang = preferredVoice.lang
  }

  utterance.onend = () => {
    isSpeaking.value = false
  }

  utterance.onerror = () => {
    isSpeaking.value = false
  }

  return utterance
}

const toggleSpeech = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  if (isSpeaking.value) {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    return
  }

  if (!speechText.value.trim()) return

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(createUtterance())
  isSpeaking.value = true
}

onBeforeUnmount(() => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
})
</script>

<style scoped>
.custom-page {
  padding: 1rem;
  background: linear-gradient(135deg, #f8f4ef 0%, #eee5da 100%);
}

.custom-container {
  max-width: 900px;
  margin: 0 auto;
}

.title {
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #4a3e2d;
}

.section-card {
  background: #ffffffd9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #3b2f22;
}

.section-help {
  margin-bottom: 12px;
  line-height: 1.7;
  color: #4a4a4a;
}

.textarea-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.banner-error {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff3e0;
  color: #e65100;
  border-radius: 6px;
  font-size: 0.9rem;
}

.button-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-stop {
  background: #e74c3c;
  color: white;
}

.status-text {
  color: #5a4b3e;
  font-size: 14px;
}
</style>
