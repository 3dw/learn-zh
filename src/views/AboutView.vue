<template>
	<div
		class="mx-auto max-w-xl px-6 py-12 leading-loose lg:min-h-dvh lg:flex lg:flex-col lg:justify-center"
	>
		<h1 class="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
			關於本站
		</h1>
		<p class="mb-4 text-base text-zinc-700 dark:text-zinc-300">
			<strong>學齡前的早療小教室</strong> 是一個開放、免費的華文自學平台，
			讓任何人都能隨時隨地透過聆聽、跟讀與 AI 輔助，輕鬆學習華文。
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
			<li><strong>AI 圖片學</strong> — 拍下身邊的任何物品，AI 立刻告訴你華文怎麼說。生活即教室，隨時隨地都能學華文。</li>
			<li><strong>情境識別互動題</strong> — 依據圖片與對話判斷情境，分級題型可持續擴充題庫與圖片。</li>
			<li><strong>捷運站名測驗</strong> — 聽站名、猜路線，用台北捷運練習華文地名發音。連續答對還有獎勵！</li>
			<li><strong>自訂朗讀</strong> — 輸入任何華文文字，立即聆聽標準發音。反覆練習、聽說並進，讓口語越來越自然。</li>
			<li><strong>萌典</strong> — 查詢華文單字、成語、詞組的釋義與用法。</li>
			<li><strong>站名學習</strong> — 搭配路線圖與語音，認識台北捷運各站華文站名。以選擇題練習，輕鬆建立生活用字庫。</li>
			<li><strong>華文字卡（Flashcards）</strong> — 用圖片搭配華文句子學習，支援台灣口音華文朗讀。可快速切換身體、情緒、在家情境與數字主題。</li>
			<li><strong>兌幣練習</strong> — 拖拉硬幣到兌換區，練習硬幣面額換算，培養日常生活的數感與金錢概念。</li>
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
