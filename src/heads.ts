/**
 * Shared, framework-agnostic page <head> metadata.
 *
 * This is the single source of truth for per-route titles & descriptions,
 * consumed by BOTH:
 *   - the Cloudflare Worker (server/index.ts) — injects the head server-side
 *     via HTMLRewriter so crawlers / social cards see the right meta;
 *   - the client router (src/router/index.ts) — updates the tab title on SPA
 *     navigation.
 *
 * Keep this file free of DOM / Worker APIs so it bundles cleanly in both.
 * The og:image is shared across every page; only title + description differ.
 */

export const SITE = {
	name: '自主學華文',
	baseUrl: 'https://zh.alearn.org.tw',
	ogImage: 'https://zh.alearn.org.tw/og-image.jpg',
	locale: 'zh_TW',
} as const

export interface PageHead {
	/** Page-specific title, without the site-name suffix. */
	title: string
	/** Meta description for this page. */
	description: string
}

export interface ResolvedHead {
	/** Full <title> — suffixed with the site name (except the home page). */
	title: string
	description: string
	/** Canonical absolute URL for this page. */
	url: string
}

const HOME: PageHead = {
	title: SITE.name,
	description:
		'用最直覺的方式，讓華文學習融入每一天。集合自訂朗讀、三字經、AI 圖片學、書寫遊戲、字卡與捷運站名等多種華語自學工具。',
}

type LineKey = 'bannan' | 'tamshui' | 'circular'

/** Taipei MRT line quizzes share a page component but get per-line meta. */
const LINE_QUIZ: Record<LineKey, PageHead> = {
	bannan: {
		title: '板南線站名學習',
		description: '搭配台北捷運板南線路線圖與台灣口音語音，以選擇題認識各站華文站名，輕鬆建立生活用字庫。',
	},
	tamshui: {
		title: '淡水信義線站名學習',
		description: '搭配台北捷運淡水信義線路線圖與台灣口音語音，以選擇題認識各站華文站名，輕鬆建立生活用字庫。',
	},
	circular: {
		title: '環狀線站名學習',
		description: '搭配台北捷運環狀線路線圖與台灣口音語音，以選擇題認識各站華文站名，輕鬆建立生活用字庫。',
	},
}

/** Exact pathname (no trailing slash) → page head. */
const PAGES: Record<string, PageHead> = {
	'/': HOME,
	'/about': {
		title: '關於本站',
		description:
			'認識「自主學華文」的理念與技術：一個以 Vue 3 與 Cloudflare 打造的開源專案，協助自學者用最直覺的方式學習華語。',
	},
	'/custom': {
		title: '自訂朗讀',
		description:
			'輸入任何華文文字，立即聆聽標準台灣口音發音，並可用 CSV 設定同音字替換。反覆練習、聽說並進，讓口語越來越自然。',
	},
	'/three-character': {
		title: '三字經',
		description: '從千年經典出發，三字一句、朗朗上口。搭配台灣口音語音朗讀，在節奏中感受漢字之美，奠定文化根基。',
	},
	'/what-is-this': {
		title: 'AI 圖片學',
		description: '拍下身邊的任何物品，AI 立刻告訴你華文與英文怎麼說。生活即教室，隨時隨地都能學華文。',
	},
	'/writing-practice': {
		title: '鏤空書寫練習',
		description: '輸入字詞，以萌典字圖呈現鏤空字體，用手指或滑鼠描寫，從筆畫中熟悉漢字結構。',
	},
	'/writing-game': {
		title: '書寫遊戲',
		description: '選擇 1~6 年級程度，隨機練習國小常用生詞，寫完累積進度，集滿分數就有獎勵畫面！',
	},
	'/situations': {
		title: '情境識別互動題',
		description: '依據圖片與對話判斷情境，分級題型可持續擴充題庫與圖片，在互動中學習華語生活情境。',
	},
	'/situations/editor': {
		title: '情境題編輯器',
		description: '建立與編輯情境識別互動題的題庫與圖片，打造專屬的華語情境學習內容。',
	},
	'/bannan-line-quiz': LINE_QUIZ.bannan,
	'/tamshui-line-quiz': LINE_QUIZ.tamshui,
	'/circular-line-quiz': LINE_QUIZ.circular,
	'/mrt-quiz': {
		title: '捷運站名測驗',
		description: '聽站名、猜路線，用台北捷運練習華文地名發音。連續答對還有獎勵！',
	},
	'/voice-install-guide': {
		title: '語音安裝說明',
		description:
			'找不到華語語音？依照本指南在 Windows、macOS、iOS 與 Android 安裝台灣口音中文語音，讓朗讀功能正常運作。',
	},
	'/flashcards/body': {
		title: '身體部位字卡',
		description: '用圖片搭配華文句子學習身體部位詞彙，支援台灣口音華文朗讀。',
	},
	'/flashcards/emotion': {
		title: '情緒字卡',
		description: '用圖片搭配華文句子學習各種情緒詞彙，支援台灣口音華文朗讀。',
	},
	'/flashcards/env1-at-home': {
		title: '在家情境字卡',
		description: '用圖片搭配華文句子學習居家生活情境詞彙，支援台灣口音華文朗讀。',
	},
	'/flashcards/number': {
		title: '數字字卡',
		description: '用圖片搭配華文句子學習數字詞彙，支援台灣口音華文朗讀。',
	},
}

/** Drop the trailing slash (keeping the root "/") and strip any query/hash. */
function normalizePath(pathname: string): string {
	let path = pathname.split('?')[0]?.split('#')[0] ?? '/'
	if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
	return path || '/'
}

function lookup(path: string): PageHead {
	const exact = PAGES[path]
	if (exact) return exact

	// Dynamic route: /line-quiz/:lineKey
	const lineMatch = path.match(/^\/line-quiz\/(bannan|tamshui|circular)$/)
	if (lineMatch) return LINE_QUIZ[lineMatch[1] as LineKey]

	// Unknown route → fall back to the home/site head.
	return HOME
}

/** Resolve the full head metadata for a given pathname. */
export function resolveHead(pathname: string): ResolvedHead {
	const path = normalizePath(pathname)
	const page = lookup(path)
	const title = page.title === SITE.name ? page.title : `${page.title}｜${SITE.name}`
	return {
		title,
		description: page.description,
		url: SITE.baseUrl + path,
	}
}
