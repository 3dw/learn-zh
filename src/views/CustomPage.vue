<template>
	<div class="min-h-dvh bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-200 px-4 py-6 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
		<div class="mx-auto max-w-3xl">
			<h1 class="mb-4 text-3xl font-bold text-amber-950 dark:text-amber-100">
				自訂朗讀 Demo
			</h1>

			<section
				class="mb-4 rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
			>
				<div class="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
					1) 輸入長篇文字
				</div>
				<p class="mb-3 leading-relaxed text-stone-600 dark:text-zinc-300">
					使用說明：將想朗讀的內容貼到下方，可輸入多段文字。系統會保留換行，朗讀時依目前內容播放。
				</p>
				<textarea
					v-model="rawText"
					class="box-border w-full resize-y rounded border border-stone-300 bg-white p-2 font-inherit text-base text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
					placeholder="請輸入要朗讀的內容..."
					rows="4"
				/>
			</section>

			<section
				class="mb-4 rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
			>
				<div class="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
					2) 輸入同音字對照（CSV）
				</div>
				<p class="mb-3 leading-relaxed text-stone-600 dark:text-zinc-300">
					使用說明：每行一組，格式為「原字詞,替換字詞」。例如：
					<code class="rounded bg-stone-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">教,叫</code>、
					<code class="rounded bg-stone-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">為人子,危人子</code>。空白行會自動忽略。
				</p>
				<textarea
					v-model="rawCsv"
					class="box-border w-full resize-y rounded border border-stone-300 bg-white p-2 font-inherit text-base text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
					placeholder="教,叫&#10;為人子,危人子"
					rows="3"
				/>
				<div
					v-if="csvErrors.length > 0"
					class="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
				>
					<div v-for="error in csvErrors" :key="error">{{ error }}</div>
				</div>
			</section>

			<section
				class="mb-4 rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
			>
				<div class="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
					3) 檢查替換後內容
				</div>
				<p class="mb-3 leading-relaxed text-stone-600 dark:text-zinc-300">
					使用說明：這裡會顯示朗讀前實際送出的文字，方便先確認同音字替換是否符合預期。
				</p>
				<textarea
					v-model="speechText"
					class="box-border w-full resize-y rounded border border-stone-300 bg-stone-50 p-2 font-inherit text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
					readonly
					rows="4"
				/>
			</section>

			<section
				class="mb-4 rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
			>
				<div class="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
					4) 按鍵朗讀（台灣口音優先）
				</div>
				<p class="mb-3 leading-relaxed text-stone-600 dark:text-zinc-300">
					使用說明：按「開始朗讀」播放，按「停止朗讀」可立即停止。語音會優先使用 zh-TW 與台灣相關語音。
				</p>
				<div class="flex flex-wrap items-center gap-3">
					<button
						type="button"
						class="cursor-pointer rounded border-0 px-4 py-2 text-base font-medium text-white transition hover:opacity-90"
						:class="isSpeaking ? 'bg-red-500' : 'bg-emerald-500'"
						@click="toggleSpeech"
					>
						{{ isSpeaking ? '停止朗讀' : '開始朗讀' }}
					</button>
					<span class="text-sm text-stone-600 dark:text-zinc-400">{{ statusText }}</span>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ZH_TW_PREFERRED_KEYWORDS, getPreferredVoice, getVoicesAsync } from '@/utils/speechVoice'

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
	if (typeof window === 'undefined' || !window.speechSynthesis) return

	if (isSpeaking.value) {
		window.speechSynthesis.cancel()
		isSpeaking.value = false
		return
	}

	if (!speechText.value.trim()) return

	window.speechSynthesis.cancel()
	window.speechSynthesis.speak(await createUtterance())
	isSpeaking.value = true
}

onBeforeUnmount(() => {
	if (typeof window === 'undefined' || !window.speechSynthesis) return
	window.speechSynthesis.cancel()
})
</script>
