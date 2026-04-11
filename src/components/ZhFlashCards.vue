<script setup lang="ts">
import { computed, ref } from 'vue'
import { getPreferredZhTwFemaleVoice, getVoicesAsync } from '@/utils/speechVoice'

export interface FlashCardItem {
  chinese: string
  image: string
}

const props = defineProps<{
  title: string
  cards: FlashCardItem[]
}>()

const searchQuery = ref('')
const speakingText = ref('')

const filteredCards = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return props.cards
  return props.cards.filter((card) => card.chinese.includes(query))
})

const speakChinese = async (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  if (!text.trim()) return

  window.speechSynthesis.cancel()
  speakingText.value = text

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-TW'
  utterance.rate = 0.9

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
</script>

<template>
  <section class="flashcards-page">
    <header class="page-header">
      <h1>{{ title }}</h1>
      <p>有圖字卡｜點擊「朗讀」鈕可朗讀中文</p>
      <input v-model="searchQuery" class="search-input" placeholder="搜尋中文關鍵字" />
    </header>

    <div class="cards-grid">
      <article v-for="card in filteredCards" :key="card.chinese" class="card-item">
        <img
          :src="card.image"
          :alt="card.chinese"
          class="card-image"
          loading="lazy"
          decoding="async"
        />
        <div class="card-footer">
          <p class="card-text">{{ card.chinese }}</p>
          <button type="button" class="speak-btn" @click="speakChinese(card.chinese)">
            {{ speakingText === card.chinese ? '朗讀中...' : '朗讀' }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.flashcards-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.page-header p {
  margin: 0.5rem 0 1rem;
  color: #666;
}

.search-input {
  width: 100%;
  max-width: 360px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
}

.cards-grid {
  margin-top: 1.25rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.card-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #f5f5f5;
}

.card-footer {
  padding: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: space-between;
}

.card-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.35;
}

.speak-btn {
  border: 0;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  background: #2b8a3e;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
}
</style>
