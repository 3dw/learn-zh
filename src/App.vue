<script setup lang="ts">
import { computed, onBeforeUnmount, watchEffect } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { useSpeechAvailability } from './composables/useSpeechAvailability'

const linkClass =
	'inline-block border-l border-stone-200 px-4 py-0.5 text-xs text-zinc-600 no-underline transition first:border-0 first:pl-0 hover:bg-emerald-500/15 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-emerald-400/10'
const exactActiveClass = 'font-medium text-zinc-900 hover:bg-transparent dark:text-zinc-100 dark:hover:bg-transparent'
const flashcardsDropdownClass =
	'relative inline-block border-l border-stone-200 px-4 py-0.5 text-xs text-zinc-600 transition first:border-0 first:pl-0 dark:border-zinc-700 dark:text-zinc-300'
const flashcardsSummaryClass =
	'cursor-pointer list-none rounded-sm px-1 py-0.5 hover:bg-emerald-500/15 dark:hover:bg-emerald-400/10'
const flashcardsMenuClass =
	'absolute left-1/2 z-10 mt-2 w-40 -translate-x-1/2 rounded-md border border-stone-200 bg-stone-50 p-1 text-left shadow-md dark:border-zinc-700 dark:bg-zinc-900'
const flashcardsMenuItemClass =
	'block rounded-sm px-2 py-1 text-xs text-zinc-600 no-underline transition hover:bg-emerald-500/15 dark:text-zinc-300 dark:hover:bg-emerald-400/10'
const { voicePlaybackBlocked } = useSpeechAvailability()
const route = useRoute()
const isFlashcardsRoute = computed(() => route.path.startsWith('/flashcards/'))

watchEffect(() => {
	if (typeof document === 'undefined') return
	const appRoot = document.getElementById('app')
	if (!appRoot) return

	appRoot.style.setProperty('--app-banner-height', voicePlaybackBlocked.value ? '2.875rem' : '0rem')
})

onBeforeUnmount(() => {
	if (typeof document === 'undefined') return
	const appRoot = document.getElementById('app')
	if (!appRoot) return

	appRoot.style.removeProperty('--app-banner-height')
})
</script>

<template>
	<header class="fixed inset-x-0 top-0 z-[1000] border-b border-stone-200 bg-stone-50/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
		<div
			v-if="voicePlaybackBlocked"
			class="border-b border-amber-300 bg-amber-100/95 dark:border-amber-900 dark:bg-amber-950/95"
		>
			<div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-amber-950 dark:text-amber-100">
				<p class="m-0">目前沒有可用的華語語音<span class="hidden md:inline">，語音播放按鈕已暫時停用</span></p>
				<RouterLink
					to="/voice-install-guide"
					class="rounded-md bg-amber-900 px-3 py-1 text-xs font-medium text-white no-underline transition hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
				>
					查看安裝說明
				</RouterLink>
			</div>
		</div>
		<div class="mx-auto max-w-7xl px-4 py-3 leading-snug">
			<HelloWorld msg="學齡前的早療小教室" />
			<nav class="mt-3 w-full text-center">
				<RouterLink to="/" :class="linkClass" :exact-active-class="exactActiveClass">
					首頁
				</RouterLink>
				<RouterLink to="/what-is-this" :class="linkClass" :exact-active-class="exactActiveClass">
					AI 圖片學
				</RouterLink>
				<RouterLink to="/situations" :class="linkClass" :exact-active-class="exactActiveClass">
					情境識別
				</RouterLink>
				<RouterLink to="/mrt-quiz" :class="linkClass" :exact-active-class="exactActiveClass">
					語音選站名
				</RouterLink>
				<RouterLink to="/custom" :class="linkClass" :exact-active-class="exactActiveClass">
					自訂朗讀
				</RouterLink>
				<a
					href="https://www.moedict.tw"
					target="_blank"
					rel="noopener"
					:class="linkClass"
				>
					萌典
				</a>
				<RouterLink to="/bannan-line-quiz" :class="linkClass" :exact-active-class="exactActiveClass">
					捷運站名
				</RouterLink>
				<details :class="flashcardsDropdownClass">
					<summary
						:class="[
							flashcardsSummaryClass,
							isFlashcardsRoute ? 'font-medium text-zinc-900 dark:text-zinc-100' : '',
						]"
					>
						字卡
					</summary>
					<div :class="flashcardsMenuClass">
						<RouterLink to="/flashcards/body" :class="flashcardsMenuItemClass" :exact-active-class="exactActiveClass">
							健康字卡
						</RouterLink>
						<RouterLink to="/flashcards/emotion" :class="flashcardsMenuItemClass" :exact-active-class="exactActiveClass">
							情緒字卡
						</RouterLink>
						<RouterLink to="/flashcards/env1-at-home" :class="flashcardsMenuItemClass" :exact-active-class="exactActiveClass">
							在家情境字卡
						</RouterLink>
						<RouterLink to="/flashcards/number" :class="flashcardsMenuItemClass" :exact-active-class="exactActiveClass">
							數字字卡
						</RouterLink>
					</div>
				</details>
				<a
					href="https://freemath-5yx.pages.dev/coin-exchange"
					target="_blank"
					rel="noopener"
					:class="linkClass"
				>
					兌幣練習
				</a>
				<RouterLink to="/voice-install-guide" :class="linkClass" :exact-active-class="exactActiveClass">
					安裝語音
				</RouterLink>
				<RouterLink to="/about" :class="linkClass" :exact-active-class="exactActiveClass">
					關於
				</RouterLink>
			</nav>
		</div>
	</header>

	<main class="w-full">
		<RouterView />
	</main>
</template>
