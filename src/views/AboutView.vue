<template>
	<div
		class="mx-auto max-w-xl px-6 py-12 leading-loose lg:min-h-dvh lg:flex lg:flex-col lg:justify-center"
	>
		<h1 class="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
			關於本站
		</h1>
		<p class="mb-4 text-base text-zinc-700 dark:text-zinc-300">
			<strong>自主學中文</strong> 是一個開放、免費的中文自學平台，
			讓任何人都能隨時隨地透過聆聽、跟讀與 AI 輔助，輕鬆學習中文。
		</p>

		<h2 class="mb-2 mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
			我們的理念
		</h2>
		<p class="mb-4 text-base text-zinc-700 dark:text-zinc-300">
			語言學習不應受限於時間與地點。我們相信，只要有好的工具與足夠的練習，
			每個人都能掌握台灣華文的基礎。
		</p>

		<h2 class="mb-2 mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
			功能介紹
		</h2>
		<ul class="list-disc space-y-2 pl-5 text-base text-zinc-700 dark:text-zinc-300">
			<li><strong>自訂朗讀</strong> — 輸入任意中文，立即生成語音，反覆聆聽練習。</li>
			<li><strong>三字經</strong> — 以千年經典為素材，節奏感強，適合入門打底。</li>
			<li><strong>AI 圖片學</strong> — 拍下身邊物品，AI 即時告知中文名稱與用法。</li>
			<li><strong>捷運站名測驗</strong> — 聽站名、猜路線，用台北捷運練習中文地名發音。</li>
		</ul>

		<h2 class="mb-2 mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
			技術資訊
		</h2>
		<p class="text-base text-zinc-700 dark:text-zinc-300">
			本站以 <strong>Vue 3</strong> 開發，部署於 <strong>Cloudflare Workers</strong>，
			原始碼公開於
			<a
				href="https://github.com/3dw/learn-zh"
				target="_blank"
				rel="noopener"
				class="text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
			>
				GitHub
			</a>，
			歡迎貢獻與回饋。
		</p>
	</div>
</template>
