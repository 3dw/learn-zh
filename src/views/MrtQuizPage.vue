<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSpeechAvailability } from '@/composables/useSpeechAvailability'
import { getPreferredZhTwFemaleVoice, getVoicesAsync } from '../utils/speechVoice'

interface Station {
	name: string
	line: string
}

const ALL_STATIONS: Station[] = [
	// 板南線
	...['頂埔','永寧','土城','海山','亞東醫院','府中','板橋','新埔','江子翠',
		'龍山寺','西門','台北車站','善導寺','忠孝新生','忠孝復興','忠孝敦化',
		'國父紀念館','市政府','永春','後山埤','昆陽','南港','南港展覽館']
		.map(name => ({ name, line: '板南線' })),
	// 淡水信義線
	...['淡水','紅樹林','竹圍','關渡','忠義','復興崗','北投','奇岩','唭哩岸',
		'石牌','明德','芝山','士林','劍潭','圓山','民權西路','中山',
		'台大醫院','中正紀念堂','東門','大安森林公園','大安','信義安和',
		'台北101/世貿','象山']
		.map(name => ({ name, line: '淡水信義線' })),
	// 環狀線
	...[
		'大坪林',
		'十四張',
		'秀朗橋',
		'景平',
		'景安',
		'中和',
		'橋和',
		'中原',
		'板新',
		'新埔民生',
		'頭前庄',
		'幸福',
		'新北產業園區',
	].map(name => ({ name, line: '環狀線' })),
]

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr]
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[a[i], a[j]] = [a[j]!, a[i]!]
	}
	return a
}

function newQuestion() {
	const idx = Math.floor(Math.random() * ALL_STATIONS.length)
	const correct = ALL_STATIONS[idx]!
	const others = shuffle(ALL_STATIONS.filter((_, i) => i !== idx)).slice(0, 3)
	const choices = shuffle([correct, ...others])
	return { correct, choices }
}

const question = ref(newQuestion())
const selected = ref<Station | null>(null)
const score = ref(0)
const streak = ref(0)
const showReward = ref(false)
const totalAnswered = ref(0)
const { voicePlaybackAvailable, voicePlaybackBlocked } = useSpeechAvailability()

async function speak() {
	if (!voicePlaybackAvailable.value || typeof window === 'undefined' || !window.speechSynthesis) return
	const voices = await getVoicesAsync()
	const utterance = new SpeechSynthesisUtterance(question.value.correct.name)
	utterance.lang = 'zh-TW'
	utterance.rate = 0.85
	const voice = getPreferredZhTwFemaleVoice(voices)
	if (voice) {
		utterance.voice = voice
		utterance.lang = voice.lang
	}
	window.speechSynthesis.cancel()
	window.speechSynthesis.speak(utterance)
}

function choose(station: Station) {
	if (selected.value !== null) return
	selected.value = station
	totalAnswered.value++
	if (station.name === question.value.correct.name) {
		score.value++
		streak.value++
		if (streak.value > 0 && streak.value % 5 === 0) {
			showReward.value = true
		}
	} else {
		streak.value = 0
	}
}

function next() {
	question.value = newQuestion()
	selected.value = null
}

function dismissReward() {
	showReward.value = false
	next()
}

onMounted(() => {})
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-16 pt-8 text-center">
		<h1 class="mb-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
			🚇 捷運站名測驗
		</h1>
		<p class="mb-6 text-base text-zinc-600 opacity-80 dark:text-zinc-400">
			聽語音，選出正確的站名！
		</p>

		<div
			v-if="showReward"
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/55"
			@click="dismissReward"
		>
			<div
				class="w-[90%] max-w-sm rounded-3xl bg-white p-10 text-center dark:bg-zinc-900"
				@click.stop
			>
				<div class="mb-3 text-6xl">🎉</div>
				<h2 class="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
					連續答對 {{ streak }} 題！
				</h2>
				<p class="mb-6 text-zinc-600 dark:text-zinc-300">太棒了，繼續加油！</p>
				<button
					type="button"
					class="cursor-pointer rounded-xl border-0 bg-emerald-500 px-7 py-2.5 text-base font-semibold text-white transition hover:opacity-90"
					@click.stop="dismissReward"
				>
					繼續挑戰
				</button>
			</div>
		</div>

		<div class="mb-8 flex flex-wrap justify-center gap-6 text-sm text-zinc-700 dark:text-zinc-300">
			<span>得分：<strong>{{ score }}</strong></span>
			<span>連續答對：<strong>{{ streak }}</strong></span>
			<span>作答：<strong>{{ totalAnswered }}</strong> 題</span>
		</div>

		<div
			class="rounded-2xl border border-stone-200 bg-white/80 px-6 py-8 dark:border-zinc-700 dark:bg-zinc-900/80"
		>
			<button
				type="button"
				class="mb-5 rounded-lg border border-stone-300 bg-transparent px-4 py-1.5 text-base text-zinc-800 transition hover:border-emerald-500/80 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-600 dark:text-zinc-200"
				:disabled="voicePlaybackBlocked"
				@click="speak"
			>
				🔊 再聽一次
			</button>
			<p class="mb-5 text-base text-zinc-700 dark:text-zinc-300">
				你聽到的是哪一個捷運站？
			</p>

			<div class="flex flex-col gap-3">
				<button
					v-for="station in question.choices"
					:key="station.name"
					type="button"
					class="flex cursor-pointer items-center justify-between rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 text-left text-zinc-800 transition hover:border-emerald-500/70 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
					:class="{
						'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100':
							selected !== null && station.name === question.correct.name,
						'border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/40 dark:text-red-100':
							selected?.name === station.name && station.name !== question.correct.name,
						'cursor-default opacity-45':
							selected !== null &&
							station.name !== question.correct.name &&
							selected?.name !== station.name,
					}"
					@click="choose(station)"
				>
					<span class="text-lg font-semibold">{{ station.name }}</span>
					<span
						class="text-xs opacity-55"
						:class="{
							'opacity-70':
								selected !== null && station.name === question.correct.name,
						}"
					>
						{{ station.line }}
					</span>
				</button>
			</div>

			<div v-if="selected !== null" class="mt-6 flex flex-col items-center gap-4">
				<span
					v-if="selected.name === question.correct.name"
					class="text-lg font-semibold text-emerald-600 dark:text-emerald-400"
				>
					✅ 答對了！
				</span>
				<span v-else class="text-base font-semibold text-red-600 dark:text-red-400">
					❌ 答錯了，是「{{ question.correct.name }}」
				</span>
				<button
					type="button"
					class="cursor-pointer rounded-xl border-0 bg-emerald-500 px-7 py-2.5 text-base font-semibold text-white transition hover:opacity-90"
					@click="next"
				>
					下一題 →
				</button>
			</div>
		</div>
	</div>
</template>
