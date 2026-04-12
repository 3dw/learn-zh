<template>
	<div class="min-h-dvh bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-200 px-4 py-6 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
		<div
			class="mx-auto max-w-2xl rounded-2xl border border-stone-200/80 bg-white/85 px-6 py-6 text-center shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/85"
		>
			<h1 class="mb-3.5 text-3xl font-bold text-amber-950 dark:text-amber-100">
				三字經節選
			</h1>
			<div class="mb-6 whitespace-pre-wrap text-left text-xl leading-relaxed text-zinc-800 dark:text-zinc-100">
				{{ text }}
			</div>
			<button
				type="button"
				class="min-w-[120px] rounded border-0 bg-emerald-500 px-4 py-2 text-base font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-45"
				:disabled="voicePlaybackBlocked"
				@click="toggleSpeech"
			>
				{{ isSpeaking ? '暫停' : '朗讀' }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useSpeechAvailability } from '@/composables/useSpeechAvailability'
import { ZH_TW_PREFERRED_KEYWORDS, getPreferredVoice, getVoicesAsync } from '@/utils/speechVoice'

const text = `人之初，性本善，性相近，習相遠。
苟不教，性乃遷，教之道，貴以專。
昔孟母，擇鄰處，子不學，斷機杼。
竇燕山，有義方，教五子，名俱揚。
養不教，父之過，教不嚴，師之惰。
子不學，非所宜，幼不學，老何為。
玉不琢，不成器，人不學，不知義。
為人子，方少時，親師友，習禮儀。
首孝悌，次見聞。`

const homophoneMap: Record<string, string> = {
	教: '叫',
	為人子: '危人子',
	鄰處: '鄰杵',
}

const isSpeaking = ref(false)
const { voicePlaybackAvailable, voicePlaybackBlocked } = useSpeechAvailability()

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const speechText = computed(() => {
	let processedText = text

	Object.entries(homophoneMap).forEach(([original, replacement]) => {
		processedText = processedText.replace(new RegExp(escapeRegExp(original), 'g'), replacement)
	})

	return processedText
})

const createUtterance = async () => {
	const voices = await getVoicesAsync()
	const utterance = new SpeechSynthesisUtterance(speechText.value)
	utterance.lang = 'zh-TW'
	utterance.rate = 0.9

	const preferredVoice = getPreferredVoice('zh-TW', ZH_TW_PREFERRED_KEYWORDS, voices)
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

const toggleSpeech = async () => {
	if (!voicePlaybackAvailable.value || typeof window === 'undefined' || !window.speechSynthesis) return

	if (isSpeaking.value) {
		window.speechSynthesis.cancel()
		isSpeaking.value = false
		return
	}

	window.speechSynthesis.cancel()
	window.speechSynthesis.speak(await createUtterance())
	isSpeaking.value = true
}

onBeforeUnmount(() => {
	if (typeof window === 'undefined' || !window.speechSynthesis) return
	window.speechSynthesis.cancel()
})
</script>
