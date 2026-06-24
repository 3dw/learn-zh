<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { getWordPool, MAX_GRADE } from '../data/gradeWords'
import { ZH_TW_PREFERRED_KEYWORDS, speakTextWithPreferredVoice } from '../utils/speechVoice'

const IMAGE_SIZE = 220
const GOAL = 10

const grade = ref(1)
const font = ref('kai')
const hollow = ref(true)
const penColor = ref('#1b3859')
const penWidth = ref(9)

const word = ref('')
const score = ref(0)
const lastWord = ref('')

const chars = computed(() => Array.from(word.value).filter((c) => c.trim() !== ''))
const progressPct = computed(() => Math.min(100, (score.value / GOAL) * 100))
const finished = computed(() => score.value >= GOAL)

function pickWord() {
	const pool = getWordPool(grade.value)
	if (pool.length === 0) return
	// 盡量避免連續出現同一個詞
	let next = pool[Math.floor(Math.random() * pool.length)]
	if (pool.length > 1) {
		let guard = 0
		while (next === lastWord.value && guard < 8) {
			next = pool[Math.floor(Math.random() * pool.length)]
			guard++
		}
	}
	lastWord.value = next
	word.value = next
}

function speakWord() {
	if (!word.value) return
	speakTextWithPreferredVoice(word.value, 'zh-TW', ZH_TW_PREFERRED_KEYWORDS)
}

function finishWord() {
	if (finished.value) return
	score.value += 1
	if (score.value >= GOAL) return
	pickWord()
	clearAll()
}

function skipWord() {
	pickWord()
	clearAll()
}

function restart() {
	score.value = 0
	pickWord()
	clearAll()
}

function charImgUrl(char: string): string {
	const base = `https://www.moedict.tw/${encodeURIComponent(char)}.png`
	return font.value === 'kai' ? base : `${base}?font=${font.value}`
}

const canvasMap = new Map<number, HTMLCanvasElement>()
const drawing = ref(false)
let activeIndex = -1
let activePointerId: number | null = null
let lastX = 0
let lastY = 0

function applyStyle(ctx: CanvasRenderingContext2D) {
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'
	ctx.lineWidth = penWidth.value
	ctx.strokeStyle = penColor.value
	ctx.fillStyle = penColor.value
}

function resetCanvas(canvas: HTMLCanvasElement) {
	const ratio = window.devicePixelRatio || 1
	canvas.width = Math.round(IMAGE_SIZE * ratio)
	canvas.height = Math.round(IMAGE_SIZE * ratio)
	canvas.style.width = `${IMAGE_SIZE}px`
	canvas.style.height = `${IMAGE_SIZE}px`
	const ctx = canvas.getContext('2d')
	if (!ctx) return
	ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
	ctx.clearRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)
	applyStyle(ctx)
}

function setCanvas(index: number, el: Element | null) {
	if (!el) {
		canvasMap.delete(index)
		return
	}
	const canvas = el as HTMLCanvasElement
	canvasMap.set(index, canvas)
	resetCanvas(canvas)
}

function pointFromEvent(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
	const rect = canvas.getBoundingClientRect()
	return { x: clientX - rect.left, y: clientY - rect.top }
}

function onPointerDown(index: number, event: PointerEvent) {
	const canvas = canvasMap.get(index)
	if (!canvas) return
	event.preventDefault()
	try {
		canvas.setPointerCapture(event.pointerId)
	} catch {
		/* iOS WKWebView can reject pointer capture */
	}
	drawing.value = true
	activeIndex = index
	activePointerId = event.pointerId
	const ctx = canvas.getContext('2d')
	if (!ctx) return
	applyStyle(ctx)
	const { x, y } = pointFromEvent(canvas, event.clientX, event.clientY)
	lastX = x
	lastY = y
	ctx.beginPath()
	ctx.arc(x, y, penWidth.value / 2, 0, Math.PI * 2)
	ctx.fill()
}

function onPointerMove(index: number, event: PointerEvent) {
	if (!drawing.value || activeIndex !== index || event.pointerId !== activePointerId) return
	const canvas = canvasMap.get(index)
	if (!canvas) return
	event.preventDefault()
	const ctx = canvas.getContext('2d')
	if (!ctx) return
	const { x, y } = pointFromEvent(canvas, event.clientX, event.clientY)
	ctx.beginPath()
	ctx.moveTo(lastX, lastY)
	ctx.lineTo(x, y)
	ctx.stroke()
	lastX = x
	lastY = y
}

function onPointerUp(index: number, event: PointerEvent) {
	if (activeIndex !== index || event.pointerId !== activePointerId) return
	const canvas = canvasMap.get(index)
	if (canvas) {
		try {
			if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
		} catch {
			/* ignore */
		}
	}
	drawing.value = false
	activeIndex = -1
	activePointerId = null
}

function clearOne(index: number) {
	const canvas = canvasMap.get(index)
	if (canvas) resetCanvas(canvas)
}

function clearAll() {
	for (const canvas of canvasMap.values()) resetCanvas(canvas)
}

watch(grade, () => {
	restart()
})

watch(chars, async () => {
	await nextTick()
	for (const canvas of canvasMap.values()) resetCanvas(canvas)
})

onMounted(() => {
	pickWord()
	for (const canvas of canvasMap.values()) resetCanvas(canvas)
})
</script>

<template>
	<div
		class="min-h-dvh bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-200 px-4 py-6 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950"
	>
		<div class="mx-auto max-w-4xl">
			<h1 class="mb-2 text-3xl font-bold text-amber-950 dark:text-amber-100">書寫遊戲</h1>
			<p class="mb-4 leading-relaxed text-stone-600 dark:text-zinc-300">
				選擇年級程度，系統會隨機出現該年級（含）以下的常用生詞。<br/>在格子裡描寫完成後，按「我寫完了！」累積進度，集滿
				{{ GOAL }} 分就有獎勵！
			</p>

			<section
				class="mb-4 rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
			>
				<div class="flex flex-wrap items-end gap-3">
					<label class="flex flex-col gap-1 text-sm text-stone-600 dark:text-zinc-300">
						<span>年級程度</span>
						<select
							v-model.number="grade"
							class="rounded border border-stone-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
						>
							<option v-for="g in MAX_GRADE" :key="g" :value="g">{{ g }} 年級</option>
						</select>
					</label>

					<label class="flex flex-col gap-1 text-sm text-stone-600 dark:text-zinc-300">
						<span>筆色</span>
						<input
							v-model="penColor"
							type="color"
							class="h-10 w-14 cursor-pointer rounded border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-950"
						/>
					</label>

					<label class="flex flex-col gap-1 text-sm text-stone-600 dark:text-zinc-300">
						<span>筆畫粗細 {{ penWidth }}</span>
						<input v-model.number="penWidth" type="range" min="3" max="20" class="w-32 cursor-pointer" />
					</label>

					<label
						class="inline-flex items-center gap-2 self-end pb-2 text-sm font-normal text-stone-600 dark:text-zinc-300"
					>
						<input v-model="hollow" type="checkbox" />
						鏤空描寫模式
					</label>
				</div>

				<div class="mt-4">
					<div class="mb-1 flex items-center justify-between text-sm font-medium text-stone-600 dark:text-zinc-300">
						<span>進度</span>
						<span>{{ score }} / {{ GOAL }} 分</span>
					</div>
					<div class="h-4 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-zinc-800">
						<div
							class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
							:style="{ width: `${progressPct}%` }"
						/>
					</div>
				</div>
			</section>

			<section
				class="mb-4 flex flex-wrap items-center justify-center gap-3 rounded-lg border border-stone-200 bg-white/90 p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
			>
				<span class="text-lg font-semibold text-amber-950 dark:text-amber-100">這次練習：{{ word }}</span>
				<button
					type="button"
					class="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
					@click="speakWord"
				>
					🔊 聽發音
				</button>
				<button
					type="button"
					class="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
					@click="clearAll"
				>
					清除全部
				</button>
				<button
					type="button"
					class="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
					@click="skipWord"
				>
					換一個詞
				</button>
			</section>

			<section class="practice-grid flex flex-wrap justify-center gap-4">
				<div
					v-for="(char, index) in chars"
					:key="`${char}-${index}`"
					class="practice-cell relative inline-flex flex-col items-center gap-2 rounded-lg border border-stone-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
				>
					<div
						class="practice-box relative"
						:style="{ width: `${IMAGE_SIZE}px`, height: `${IMAGE_SIZE}px` }"
					>
						<img
							class="practice-glyph pointer-events-none absolute inset-0 h-full w-full select-none"
							:class="{ 'practice-glyph-hollow': hollow }"
							:src="charImgUrl(char)"
							:alt="char"
							draggable="false"
						/>
						<canvas
							:ref="(el) => setCanvas(index, el as Element | null)"
							class="practice-canvas absolute inset-0"
							@pointerdown="onPointerDown(index, $event)"
							@pointermove="onPointerMove(index, $event)"
							@pointerup="onPointerUp(index, $event)"
							@pointercancel="onPointerUp(index, $event)"
							@pointerleave="onPointerUp(index, $event)"
							@contextmenu.prevent
						/>
					</div>
					<button
						type="button"
						class="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-600 transition hover:bg-stone-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						@click="clearOne(index)"
					>
						清除此字
					</button>
				</div>
			</section>

			<div class="mt-6 flex justify-center">
				<button
					type="button"
					class="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
					@click="finishWord"
				>
					我寫完了！＋1 分
				</button>
			</div>
		</div>

		<!-- 獎勵畫面 -->
		<div
			v-if="finished"
			class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 px-4"
		>
			<div
				class="reward-pop w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-2xl dark:border-amber-900 dark:bg-zinc-900"
			>
				<div class="mb-3 text-7xl">🎉</div>
				<h2 class="mb-2 text-3xl font-bold text-amber-600 dark:text-amber-300">太棒了！</h2>
				<p class="mb-6 text-lg text-stone-600 dark:text-zinc-300">
					你完成了 {{ GOAL }} 個生詞的書寫練習，繼續加油！
				</p>
				<div class="mb-6 text-5xl">🏆 ⭐ 🥇 ⭐ 🏆</div>
				<button
					type="button"
					class="rounded-full bg-emerald-500 px-8 py-3 text-lg font-bold text-white shadow-md transition hover:opacity-90 active:scale-95"
					@click="restart"
				>
					再玩一次
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.practice-canvas {
	background: transparent;
	touch-action: none;
	cursor: crosshair;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
}

.practice-glyph {
	-webkit-user-drag: none;
}

.practice-glyph-hollow {
	filter: invert(100%) grayscale(100%);
	-webkit-filter: invert(100%) grayscale(100%);
	-moz-filter: invert(100%) grayscale(100%);
	-ms-filter: invert(100%) grayscale(100%);
	-o-filter: invert(100%) grayscale(100%);
	opacity: 0.32;
}

@keyframes reward-pop {
	0% {
		transform: scale(0.7);
		opacity: 0;
	}
	60% {
		transform: scale(1.05);
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.reward-pop {
	animation: reward-pop 0.4s ease-out;
}
</style>
