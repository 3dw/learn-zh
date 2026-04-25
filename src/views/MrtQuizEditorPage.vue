<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Station {
	name: string
	line: string
}

const STORAGE_STATIONS = 'mrt-quiz-custom-stations'
const STORAGE_USE_CUSTOM = 'mrt-quiz-use-custom'

function loadStations(): Station[] {
	try {
		const raw = localStorage.getItem(STORAGE_STATIONS)
		return raw ? JSON.parse(raw) : []
	} catch { return [] }
}

const stations = ref<Station[]>(loadStations())
const useCustom = ref(localStorage.getItem(STORAGE_USE_CUSTOM) === 'true')

watch(stations, (val) => localStorage.setItem(STORAGE_STATIONS, JSON.stringify(val)), { deep: true })
watch(useCustom, (val) => localStorage.setItem(STORAGE_USE_CUSTOM, String(val)))

const canEnable = computed(() => stations.value.length >= 4)

const nameInput = ref('')
const lineInput = ref('')
const formError = ref('')

function addStation() {
	formError.value = ''
	if (!nameInput.value.trim()) { formError.value = '請填寫站名。'; return }
	if (!lineInput.value.trim()) { formError.value = '請填寫路線名稱。'; return }
	if (stations.value.some(s => s.name === nameInput.value.trim())) {
		formError.value = '這個站名已存在。'; return
	}
	stations.value.push({ name: nameInput.value.trim(), line: lineInput.value.trim() })
	nameInput.value = ''
}

function removeStation(index: number) {
	stations.value.splice(index, 1)
	if (!canEnable.value) useCustom.value = false
}

function clearAll() {
	if (!window.confirm('確定要清除所有自訂題目嗎？')) return
	stations.value = []
	useCustom.value = false
}
</script>

<template>
	<main class="mx-auto max-w-xl px-4 pb-16 pt-6">
		<header class="mb-6 flex flex-wrap items-start justify-between gap-3">
			<div>
				<h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">🚇 自訂題庫編輯</h1>
				<p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">資料儲存於此瀏覽器，不會同步到其他裝置。</p>
			</div>
			<RouterLink
				to="/mrt-quiz"
				class="inline-flex items-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-stone-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
			>
				返回測驗
			</RouterLink>
		</header>

		<!-- 題目來源切換 -->
		<section class="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
			<p class="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">題目來源</p>
			<div class="flex flex-col gap-3">
				<label class="flex cursor-pointer items-center gap-3">
					<input
						type="radio"
						:value="false"
						v-model="useCustom"
						class="h-4 w-4 accent-emerald-500"
					/>
					<span class="text-sm text-zinc-800 dark:text-zinc-200">使用系統預設題目</span>
				</label>
				<label
					class="flex cursor-pointer items-center gap-3"
					:class="{ 'opacity-40': !canEnable }"
				>
					<input
						type="radio"
						:value="true"
						v-model="useCustom"
						:disabled="!canEnable"
						class="h-4 w-4 accent-emerald-500"
					/>
					<span class="text-sm text-zinc-800 dark:text-zinc-200">
						使用自訂題目（目前 {{ stations.length }} 題）
					</span>
				</label>
			</div>
			<p v-if="!canEnable && stations.length > 0" class="mt-3 text-xs text-amber-600 dark:text-amber-400">
				需至少新增 4 題才能切換為自訂題目。
			</p>
			<p v-else-if="!canEnable" class="mt-3 text-xs text-zinc-400">
				新增 4 題以上即可啟用自訂題目。
			</p>
		</section>

		<!-- 新增題目表單 -->
		<section class="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
			<h2 class="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">新增題目</h2>
			<div class="flex flex-col gap-3">
				<div>
					<label class="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">站名（答案）</label>
					<input
						v-model="nameInput"
						type="text"
						placeholder="例：台北車站"
						class="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						@keydown.enter="addStation"
					/>
				</div>
				<div>
					<label class="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">路線名稱（顯示於選項旁）</label>
					<input
						v-model="lineInput"
						type="text"
						placeholder="例：板南線"
						class="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
						@keydown.enter="addStation"
					/>
				</div>
				<p v-if="formError" class="text-xs text-rose-600 dark:text-rose-400">{{ formError }}</p>
				<button
					type="button"
					class="self-start rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
					@click="addStation"
				>
					新增
				</button>
			</div>
		</section>

		<!-- 題目列表 -->
		<section>
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
					自訂題目列表
					<span class="ml-1 font-normal text-zinc-400">（{{ stations.length }} 題）</span>
				</h2>
				<button
					v-if="stations.length > 0"
					type="button"
					class="text-xs text-rose-500 transition hover:text-rose-700 dark:text-rose-400"
					@click="clearAll"
				>
					清除全部
				</button>
			</div>

			<div v-if="stations.length === 0" class="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950">
				尚無自訂題目，請從上方表單新增。
			</div>

			<div v-else class="space-y-2">
				<div
					v-for="(station, index) in stations"
					:key="index"
					class="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950"
				>
					<div>
						<span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ station.name }}</span>
						<span class="ml-2 text-xs text-zinc-400">{{ station.line }}</span>
					</div>
					<button
						type="button"
						class="text-xs text-rose-400 transition hover:text-rose-600"
						@click="removeStation(index)"
					>
						刪除
					</button>
				</div>
			</div>
		</section>
	</main>
</template>
