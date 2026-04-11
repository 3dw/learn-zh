<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

const linkClass =
	'inline-block border-l border-stone-200 px-4 py-0.5 text-xs text-zinc-600 no-underline transition first:border-0 first:pl-0 hover:bg-emerald-500/15 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-emerald-400/10'
const exactActiveClass = 'font-medium text-zinc-900 hover:bg-transparent dark:text-zinc-100 dark:hover:bg-transparent'
</script>

<template>
	<header
		class="fixed inset-x-0 top-0 z-[1000] border-b border-stone-200 bg-stone-50/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
	>
		<div class="mx-auto max-w-7xl px-4 py-3 leading-snug">
			<HelloWorld msg="自主學中文" />
			<nav class="mt-3 w-full text-center">
				<RouterLink to="/" :class="linkClass" :exact-active-class="exactActiveClass">
					首頁
				</RouterLink>
				<RouterLink to="/flashcards/body" :class="linkClass" :exact-active-class="exactActiveClass">
					健康字卡
				</RouterLink>
				<RouterLink to="/flashcards/emotion" :class="linkClass" :exact-active-class="exactActiveClass">
					情緒字卡
				</RouterLink>
				<RouterLink to="/flashcards/env1-at-home" :class="linkClass" :exact-active-class="exactActiveClass">
					在家情境字卡
				</RouterLink>
				<RouterLink to="/flashcards/number" :class="linkClass" :exact-active-class="exactActiveClass">
					數字字卡
				</RouterLink>
				<RouterLink to="/custom" :class="linkClass" :exact-active-class="exactActiveClass">
					自訂朗讀
				</RouterLink>
				<RouterLink to="/three-character" :class="linkClass" :exact-active-class="exactActiveClass">
					三字經
				</RouterLink>
				<RouterLink to="/what-is-this" :class="linkClass" :exact-active-class="exactActiveClass">
					AI 圖片學
				</RouterLink>
				<RouterLink to="/bannan-line-quiz" :class="linkClass" :exact-active-class="exactActiveClass">
					捷運站名
				</RouterLink>
				<RouterLink to="/mrt-quiz" :class="linkClass" :exact-active-class="exactActiveClass">
					語音選站名
				</RouterLink>
				<a
					href="https://www.moedict.tw"
					target="_blank"
					rel="noopener"
					:class="linkClass"
				>
					萌典
				</a>
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
