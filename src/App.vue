<script setup lang="ts">
import { onBeforeUnmount, watchEffect } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Navbar from './components/Navbar.vue'
import { useSpeechAvailability } from './composables/useSpeechAvailability'

const { voicePlaybackBlocked } = useSpeechAvailability()

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
			<HelloWorld msg="自主學華文" />
			<Navbar />
		</div>
	</header>

	<main class="w-full">
		<RouterView />
	</main>
</template>
