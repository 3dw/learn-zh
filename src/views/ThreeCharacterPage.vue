<template>
	<div class="min-h-dvh bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-200 px-4 py-6 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
		<div
			class="mx-auto max-w-2xl rounded-2xl border border-stone-200/80 bg-white/85 px-6 py-6 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/85"
		>
			<h1 class="mb-3.5 text-center text-3xl font-bold text-amber-950 dark:text-amber-100">
				三字經節選
			</h1>

			<div class="mb-4 text-center text-sm text-stone-500 dark:text-zinc-400">
				第 {{ currentIndex + 1 }} / {{ sentences.length }} 句
			</div>

			<div class="mb-6 rounded-lg border border-amber-200/80 bg-amber-50/60 px-4 py-5 text-center text-xl leading-relaxed text-zinc-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-zinc-100">
				{{ currentSentence }}
			</div>

			<div class="mb-6 flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					class="rounded border border-stone-300 bg-white px-4 py-2 text-base text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
					:disabled="currentIndex === 0"
					@click="goPrev"
				>
					上一句
				</button>
				<button
					type="button"
					class="min-w-[120px] rounded border-0 bg-emerald-500 px-4 py-2 text-base font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-45"
					:disabled="voicePlaybackBlocked"
					@click="toggleSpeech"
				>
					{{ isSpeaking ? '停止' : '朗讀這一句' }}
				</button>
				<button
					type="button"
					class="rounded border border-stone-300 bg-white px-4 py-2 text-base text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
					:disabled="currentIndex >= sentences.length - 1"
					@click="goNext"
				>
					下一句
				</button>
			</div>

			<section class="mb-4 rounded-lg border border-stone-200 bg-white/90 p-4 text-left shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90">
				<div class="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
					請念一遍這一句
				</div>
				<p class="mb-1 leading-relaxed text-stone-600 dark:text-zinc-300">
					按「開始錄音」後，對麥克風念出上方句子，結束後按「停止錄音」。
				</p>
				<p class="mb-3 text-xs text-zinc-400 dark:text-zinc-500">使用瀏覽器內建語音辨識，建議 Chrome / Edge</p>
				<div class="mb-3 flex flex-wrap items-center gap-3">
					<button
						v-if="srSupported"
						type="button"
						class="rounded border-0 px-4 py-2 text-base font-medium text-white transition hover:opacity-90"
						:class="listening ? 'bg-red-500' : 'bg-violet-500'"
						@click="toggleListening"
					>
						{{ listening ? '⏹ 停止錄音' : '🎤 開始錄音' }}
					</button>
					<span v-if="!srSupported" class="text-sm text-zinc-500 dark:text-zinc-400">
						此瀏覽器不支援語音辨識，請改用 Chrome 或 Edge。
					</span>
					<span v-if="listening" class="animate-pulse text-sm font-medium text-red-500">🔴 聆聽中…</span>
				</div>
				<textarea
					v-model="spokenText"
					class="box-border w-full resize-y rounded border border-stone-300 bg-white p-2 font-inherit text-base text-zinc-900 outline-none ring-violet-500/30 focus:border-violet-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
					placeholder="語音辨識結果會顯示在這裡…"
					rows="2"
				/>
			</section>

			<section class="rounded-lg border border-stone-200 bg-white/90 p-4 text-left shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90">
				<div class="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
					念得跟這一句一樣嗎？
				</div>
				<div v-if="!spokenText.trim()" class="text-stone-400 dark:text-zinc-500">
					請先完成語音錄音。
				</div>
				<template v-else>
					<div class="mb-3 flex items-center gap-4">
						<span
							class="text-4xl font-bold tabular-nums"
							:class="similarityColor"
						>{{ similarityPct }}%</span>
						<span class="text-base text-stone-600 dark:text-zinc-300">{{ similarityLabel }}</span>
					</div>
					<div class="h-3 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-700">
						<div
							class="h-full rounded-full transition-all duration-500"
							:class="similarityBarColor"
							:style="{ width: similarityPct + '%' }"
						/>
					</div>
					<p class="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
						比對方式：去除空白與標點後，以字元編輯距離計算相似度。
					</p>
				</template>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
const currentIndex = ref(0)
const { voicePlaybackAvailable, voicePlaybackBlocked } = useSpeechAvailability()

const spokenText = ref('')
const listening = ref(false)
const srSupported = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any
let recognition: SR = null

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const sentences = computed(() =>
	text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
)

const currentSentence = computed(() => sentences.value[currentIndex.value] ?? '')

const applyHomophones = (input: string) => {
	let processed = input
	Object.entries(homophoneMap).forEach(([original, replacement]) => {
		processed = processed.replace(new RegExp(escapeRegExp(original), 'g'), replacement)
	})
	return processed
}

const currentSpokenSentence = computed(() => applyHomophones(currentSentence.value))

const resetSentenceState = () => {
	stopListening()
	stopSpeech()
	spokenText.value = ''
}

const goPrev = () => {
	if (currentIndex.value <= 0) return
	currentIndex.value -= 1
	resetSentenceState()
}

const goNext = () => {
	if (currentIndex.value >= sentences.value.length - 1) return
	currentIndex.value += 1
	resetSentenceState()
}

const stopSpeech = () => {
	if (typeof window === 'undefined' || !window.speechSynthesis) return
	window.speechSynthesis.cancel()
	isSpeaking.value = false
}

const createUtterance = async (sentence: string) => {
	const voices = await getVoicesAsync()
	const utterance = new SpeechSynthesisUtterance(sentence)
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
		stopSpeech()
		return
	}

	stopListening()
	window.speechSynthesis.cancel()
	window.speechSynthesis.speak(await createUtterance(currentSpokenSentence.value))
	isSpeaking.value = true
}

function stopListening() {
	if (recognition) {
		recognition.stop()
		recognition = null
	}
	listening.value = false
}

function toggleListening() {
	if (listening.value) {
		stopListening()
		return
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const SRClass = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
	if (!SRClass) return

	stopSpeech()
	spokenText.value = ''
	recognition = new SRClass()
	recognition.lang = 'zh-TW'
	recognition.continuous = false
	recognition.interimResults = false
	recognition.maxAlternatives = 1
	recognition.onstart = () => {
		listening.value = true
	}
	recognition.onresult = (event: SR) => {
		spokenText.value = event.results[0]?.[0]?.transcript ?? ''
	}
	recognition.onerror = () => {
		listening.value = false
	}
	recognition.onend = () => {
		listening.value = false
	}
	recognition.start()
}

function levenshtein(a: string, b: string): number {
	const m = a.length
	const n = b.length
	let prev = Array.from({ length: n + 1 }, (_, i) => i)
	for (let i = 1; i <= m; i++) {
		const curr: number[] = [i]
		for (let j = 1; j <= n; j++) {
			curr[j] = a[i - 1] === b[j - 1]
				? prev[j - 1]!
				: 1 + Math.min(prev[j]!, curr[j - 1]!, prev[j - 1]!)
		}
		prev = curr
	}
	return prev[n]!
}

const similarityPct = computed(() => {
	const normalize = (s: string) => s.replace(/[\s　\p{P}]/gu, '')
	const a = normalize(currentSentence.value)
	const b = normalize(spokenText.value)
	if (!a && !b) return 100
	if (!a || !b) return 0
	const maxLen = Math.max(a.length, b.length)
	return Math.round(Math.max(0, (1 - levenshtein(a, b) / maxLen) * 100))
})

const similarityColor = computed(() => {
	const p = similarityPct.value
	if (p >= 80) return 'text-emerald-600 dark:text-emerald-400'
	if (p >= 60) return 'text-amber-600 dark:text-amber-400'
	return 'text-red-600 dark:text-red-400'
})

const similarityBarColor = computed(() => {
	const p = similarityPct.value
	if (p >= 80) return 'bg-emerald-500'
	if (p >= 60) return 'bg-amber-500'
	return 'bg-red-500'
})

const similarityLabel = computed(() => {
	const p = similarityPct.value
	if (p === 100) return '🎉 完全一樣！'
	if (p >= 80) return '👍 非常接近'
	if (p >= 60) return '😊 不錯，繼續練習'
	if (p >= 50) return '🤔 有些差異'
	return '😅 差異較多，再試一次'
})

onMounted(() => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	srSupported.value = !!((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
})

onBeforeUnmount(() => {
	stopListening()
	stopSpeech()
})
</script>
