<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

interface FontGroup {
	label: string
	fonts: { value: string; label: string }[]
}

const FONT_GROUPS: FontGroup[] = [
	{
		label: '全字庫',
		fonts: [
			{ value: 'kai', label: '楷書' },
			{ value: 'sung', label: '宋體' },
			{ value: 'ebas', label: '篆文' },
		],
	},
	{
		label: '源雲明體',
		fonts: [
			{ value: 'gwmel', label: '特細' },
			{ value: 'gwml', label: '細體' },
			{ value: 'gwmr', label: '標準' },
			{ value: 'gwmm', label: '正明' },
			{ value: 'gwmsb', label: '中明' },
		],
	},
	{
		label: 'Justfont',
		fonts: [{ value: 'openhuninn', label: 'Open 粉圓' }],
	},
	{
		label: 'cwTeX Q',
		fonts: [
			{ value: 'cwming', label: '明體' },
			{ value: 'cwhei', label: '黑體' },
			{ value: 'cwyuan', label: '圓體' },
			{ value: 'cwkai', label: '楷書' },
			{ value: 'cwfangsong', label: '仿宋' },
		],
	},
	{
		label: '王漢宗',
		fonts: [
			{ value: 'wt071', label: '中行書' },
			{ value: 'wt021', label: '中隸書' },
			{ value: 'wt064', label: '顏楷體' },
			{ value: 'wt034', label: '勘亭流' },
			{ value: 'wt040', label: '綜藝體' },
		],
	},
]

const IMAGE_SIZE = 220

const inputWord = ref('測試')
const word = ref('測試')
const font = ref('kai')
const hollow = ref(true)
const penColor = ref('#1b3859')
const penWidth = ref(9)

const chars = computed(() => Array.from(word.value).filter((c) => c.trim() !== ''))

function charImgUrl(char: string): string {
	const base = `https://www.moedict.tw/${encodeURIComponent(char)}.png`
	return font.value === 'kai' ? base : `${base}?font=${font.value}`
}

function applyWord() {
	const next = inputWord.value.trim()
	if (!next) return
	word.value = next
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

function handlePrint() {
	window.print()
}

watch(chars, async () => {
	await nextTick()
	for (const canvas of canvasMap.values()) resetCanvas(canvas)
})

onMounted(() => {
	for (const canvas of canvasMap.values()) resetCanvas(canvas)
})
</script>

<template>
	<div
		class="min-h-dvh bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-200 px-4 py-6 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950"
	>
		<div class="mx-auto max-w-4xl">
			<h1 class="print-hidden mb-2 text-3xl font-bold text-amber-950 dark:text-amber-100">
				鏤空書寫練習
			</h1>
			<p class="print-hidden mb-4 leading-relaxed text-stone-600 dark:text-zinc-300">
				輸入想練習的字詞，系統會以萌典字圖呈現淡色字樣，用手指、觸控筆或滑鼠在格子中描寫即可。
			</p>

			<section
				class="print-hidden mb-4 rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/90"
			>
				<div class="flex flex-wrap items-end gap-3">
					<label class="flex flex-col gap-1 text-sm text-stone-600 dark:text-zinc-300">
						<span>練習字詞</span>
						<input
							v-model="inputWord"
							type="text"
							class="w-48 rounded border border-stone-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
							placeholder="例如：測試"
							@keyup.enter="applyWord"
						/>
					</label>

					<label class="flex flex-col gap-1 text-sm text-stone-600 dark:text-zinc-300">
						<span>字體</span>
						<select
							v-model="font"
							class="rounded border border-stone-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
						>
							<optgroup v-for="group in FONT_GROUPS" :key="group.label" :label="group.label">
								<option v-for="f in group.fonts" :key="f.value" :value="f.value">
									{{ f.label }}
								</option>
							</optgroup>
						</select>
					</label>

					<button
						type="button"
						class="rounded bg-emerald-500 px-4 py-2 text-base font-medium text-white transition hover:opacity-90"
						@click="applyWord"
					>
						產生練習
					</button>

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
				</div>

				<div class="mt-3 flex flex-wrap items-center gap-3">
					<label
						class="inline-flex items-center gap-2 text-sm font-normal text-stone-600 dark:text-zinc-300"
					>
						<input v-model="hollow" type="checkbox" />
						鏤空（淡色）描寫模式
					</label>
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
						@click="handlePrint"
					>
						列印
					</button>
				</div>
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
						class="clear-cell-btn rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-600 transition hover:bg-stone-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
						@click="clearOne(index)"
					>
						清除此字
					</button>
				</div>
			</section>
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

@media print {
	.print-hidden,
	.practice-canvas,
	.clear-cell-btn {
		display: none !important;
	}
}
</style>
