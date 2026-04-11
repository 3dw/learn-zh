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
	<section class="mx-auto max-w-5xl px-4 pb-12 pt-6">
		<header>
			<h1 class="m-0 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
				{{ title }}
			</h1>
			<p class="mb-4 mt-2 text-zinc-600 dark:text-zinc-400">有圖字卡｜點擊「朗讀」鈕可朗讀華文</p>
			<input
				v-model="searchQuery"
				class="w-full max-w-sm rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none ring-emerald-500/25 focus:border-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
				placeholder="搜尋華文關鍵字"
			/>
		</header>

		<div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
			<article
				v-for="card in filteredCards"
				:key="card.chinese"
				class="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
			>
				<img
					:src="card.image"
					:alt="card.chinese"
					class="h-[180px] w-full bg-stone-100 object-cover dark:bg-zinc-800"
					loading="lazy"
					decoding="async"
				/>
				<div class="flex items-center justify-between gap-2.5 p-3.5">
					<p class="m-0 flex-1 text-base leading-snug text-zinc-800 dark:text-zinc-100">
						{{ card.chinese }}
					</p>
					<button
						type="button"
						class="shrink-0 cursor-pointer rounded-full border-0 bg-emerald-600 px-3 py-1.5 text-sm text-white transition hover:bg-emerald-700"
						@click="speakChinese(card.chinese)"
					>
						{{ speakingText === card.chinese ? '朗讀中...' : '朗讀' }}
					</button>
				</div>
			</article>
		</div>
	</section>
</template>
