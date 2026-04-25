<script setup lang="ts">
import { RouterLink } from 'vue-router'

const features = [
	{
		to: '/flashcards/body',
		emoji: '🃏',
		title: '華文字卡（Flashcards）',
		desc: '用圖片搭配華文句子學習，支援台灣口音華文朗讀。可快速切換身體、情緒、在家情境與數字主題。',
	},
	{
		href: 'https://www.moedict.tw',
		emoji: '📚',
		title: '萌典',
		desc: '查詢華文單字、成語、詞組的釋義與用法。',
	},
	{
		to: '/three-character',
		emoji: '📖',
		title: '三字經',
		desc: '從千年經典出發，三字一句，朗朗上口。在節奏中感受漢字之美，奠定紮實的文化根基。',
	},
	{
		to: '/custom',
		emoji: '🎙️',
		title: '自訂朗讀',
		desc: '輸入任何華文文字，立即聆聽標準發音。反覆練習、聽說並進，讓口語越來越自然。',
	},
	{
		to: '/what-is-this',
		emoji: '🤖',
		title: 'AI 圖片學',
		desc: '拍下身邊的任何物品，AI 立刻告訴你華文怎麼說。生活即教室，隨時隨地都能學華文。',
	},
	{
		to: '/situations',
		emoji: '🎭',
		title: '情境識別互動題',
		desc: '依據圖片與對話判斷情境，分級題型可持續擴充題庫與圖片。',
		isPrototype: true,
	},
	{
		to: '/bannan-line-quiz',
		emoji: '🚇',
		title: '站名學習',
		desc: '搭配路線圖與語音，認識台北捷運各站華文站名。以選擇題練習，輕鬆建立生活用字庫。',
	},
	{
		to: '/mrt-quiz',
		emoji: '🚇',
		title: '捷運站名測驗',
		desc: '聽站名、猜路線，用台北捷運練習華文地名發音。連續答對還有獎勵！',
	},
]

const cardClass =
	'relative flex flex-col gap-2.5 rounded-xl border border-stone-200 bg-white/90 p-7 text-left text-zinc-700 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500/80 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-emerald-400/70'
</script>

<template>
	<main class="mx-auto max-w-3xl px-6 pb-16 pt-8">
		<section class="px-2 py-10 text-center sm:py-12">
			<div class="mb-2 text-5xl">🇹🇼</div>
			<h1 class="mb-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
				自主學華文
			</h1>
			<p class="text-lg text-zinc-600 opacity-90 dark:text-zinc-300">
				用最直覺的方式，讓華文學習融入每一天
			</p>
		</section>

		<section class="mt-8 grid gap-6 sm:grid-cols-2">
			<div v-for="f in features" :key="f.to || f.href">
				<RouterLink v-if="f.to" :to="f.to" :class="cardClass">
					<span
						v-if="f.isPrototype"
						class="absolute right-3 top-3 rounded bg-yellow-300 px-2 py-0.5 text-xs font-bold text-black"
					>
						樣稿
					</span>
					<span class="text-3xl">{{ f.emoji }}</span>
					<h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
						{{ f.title }}
					</h2>
					<p class="flex-1 text-[0.95rem] leading-relaxed">{{ f.desc }}</p>
					<span class="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
						開始 →
					</span>
				</RouterLink>
				<a v-else :href="f.href" :class="cardClass" target="_blank" rel="noopener">
					<span
						v-if="f.isPrototype"
						class="absolute right-3 top-3 rounded bg-yellow-300 px-2 py-0.5 text-xs font-bold text-black"
					>
						樣稿
					</span>
					<span class="text-3xl">{{ f.emoji }}</span>
					<h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
						{{ f.title }}
					</h2>
					<p class="flex-1 text-[0.95rem] leading-relaxed">{{ f.desc }}</p>
					<span class="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
						前往 →
					</span>
				</a>
			</div>
		</section>

		<div class="mt-16 flex flex-col items-center gap-3">
			<img src="/ig-cover.jpg" alt="王大明" class="w-48 rounded-full opacity-80" />
			<a
				href="https://www.instagram.com/wang.da.ming"
				target="_blank"
				rel="noopener"
				class="text-sm text-zinc-500 no-underline hover:text-pink-500 dark:text-zinc-400 dark:hover:text-pink-400"
			>
				ig: wang.da.ming
			</a>
		</div>
	</main>
</template>
