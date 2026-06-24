<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

type NavLink = {
	label: string
	to?: string
	href?: string
}

type NavGroup = {
	label: string
	children: NavLink[]
}

type NavItem = NavLink | NavGroup

const isGroup = (item: NavItem): item is NavGroup =>
	Array.isArray((item as NavGroup).children)

// 集中管理所有導航項目；新增頁面只需在此維護一處。
const navItems: NavItem[] = [
	// { label: '首頁', to: '/' },
	{
		label: '字卡',
		children: [
			{ label: '健康字卡', to: '/flashcards/body' },
			{ label: '情緒字卡', to: '/flashcards/emotion' },
			{ label: '在家情境字卡', to: '/flashcards/env1-at-home' },
			{ label: '數字字卡', to: '/flashcards/number' },
		],
	},
	{
		label: '捷運',
		children: [
			{ label: '捷運站名', to: '/bannan-line-quiz' },
			{ label: '語音選站名', to: '/mrt-quiz' },
		],
	},
	{ 
		label: '朗讀',
		children: [
			{ label: '三字經', to: '/three-character' },
			{ label: '自訂朗讀', to: '/custom' },
			{ label: '語音安裝說明', to: '/voice-install-guide' },
		],
	},
	{
		label: '書寫',
		children: [
			{ label: '書寫練習', to: '/writing-practice' },
			{ label: '書寫遊戲', to: '/writing-game' },
		],
	},
	{ label: '圖片學', to: '/what-is-this' },
	{ label: '安裝語音', to: '/voice-install-guide' },
	{ label: '萌典', href: 'https://www.moedict.tw' },
	{ label: '關於', to: '/about' },
]

const route = useRoute()
const navRoot = ref<HTMLElement | null>(null)
const mobileOpen = ref(false)
const openGroup = ref<string | null>(null)

const isGroupActive = (group: NavGroup) =>
	group.children.some((child) => child.to === route.path)

const toggleGroup = (label: string) => {
	openGroup.value = openGroup.value === label ? null : label
}

// 點選任何連結（路由變更）後自動收合選單。
watch(
	() => route.path,
	() => {
		mobileOpen.value = false
		openGroup.value = null
	},
)

// 點擊導航列以外的區域時收合桌面下拉選單。
const handleOutsideClick = (event: MouseEvent) => {
	if (navRoot.value && !navRoot.value.contains(event.target as Node)) {
		openGroup.value = null
	}
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick))

const exactActiveClass =
	'font-medium text-zinc-900 hover:bg-transparent dark:text-zinc-100 dark:hover:bg-transparent'

// 桌面（≥ md）水平導航列樣式
const desktopItemClass =
	'inline-block border-l border-stone-200 px-4 py-0.5 text-sm text-zinc-600 no-underline transition first:border-0 first:pl-0 hover:bg-emerald-500/15 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-emerald-400/10'
const desktopGroupClass =
	'relative inline-block border-l border-stone-200 px-4 py-0.5 text-sm text-zinc-600 transition first:border-0 first:pl-0 dark:border-zinc-700 dark:text-zinc-300'
const desktopGroupButtonClass =
	'cursor-pointer rounded-sm px-1 py-0.5 hover:bg-emerald-500/15 dark:hover:bg-emerald-400/10'
const desktopMenuClass =
	'absolute left-1/2 z-10 mt-2 w-40 -translate-x-1/2 rounded-md border border-stone-200 bg-stone-50 p-1 text-left shadow-md dark:border-zinc-700 dark:bg-zinc-900'
const desktopMenuItemClass =
	'block rounded-sm px-2 py-1 text-sm text-zinc-600 no-underline transition hover:bg-emerald-500/15 dark:text-zinc-300 dark:hover:bg-emerald-400/10'

// 手機（< md）漢堡折疊選單樣式
const mobileLinkClass =
	'block rounded-md px-3 py-2 text-sm text-zinc-600 no-underline transition hover:bg-emerald-500/15 dark:text-zinc-300 dark:hover:bg-emerald-400/10'
const mobileSubLinkClass =
	'block rounded-md py-2 pr-3 pl-8 text-sm text-zinc-600 no-underline transition hover:bg-emerald-500/15 dark:text-zinc-300 dark:hover:bg-emerald-400/10'
const mobileGroupButtonClass =
	'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-zinc-600 transition hover:bg-emerald-500/15 dark:text-zinc-300 dark:hover:bg-emerald-400/10'
</script>

<template>
	<div ref="navRoot" class="mt-3 w-full">
		<!-- 桌面：水平導航列 -->
		<nav class="hidden w-full text-center md:block">
			<RouterLink to="/" class="block">
				<div class="flex items-center justify-center">
					<img src="/logo.png" alt="Logo" class="h-10 w-10" />
				</div>
			</RouterLink>
			<template v-for="item in navItems" :key="item.label">
				<div v-if="isGroup(item)" :class="desktopGroupClass">
					<button
						type="button"
						:class="[
							desktopGroupButtonClass,
							isGroupActive(item) ? 'font-medium text-zinc-900 dark:text-zinc-100' : '',
						]"
						:aria-expanded="openGroup === item.label"
						@click="toggleGroup(item.label)"
					>
						{{ item.label }}
					</button>
					<div v-if="openGroup === item.label" :class="desktopMenuClass">
						<RouterLink
							v-for="child in item.children"
							:key="child.label"
							:to="child.to!"
							:class="desktopMenuItemClass"
							:exact-active-class="exactActiveClass"
						>
							{{ child.label }}
						</RouterLink>
					</div>
				</div>
				<a
					v-else-if="item.href"
					:href="item.href"
					target="_blank"
					rel="noopener"
					:class="desktopItemClass"
				>
					{{ item.label }}
				</a>
				<RouterLink
					v-else
					:to="item.to!"
					:class="desktopItemClass"
					:exact-active-class="exactActiveClass"
				>
					{{ item.label }}
				</RouterLink>
			</template>
		</nav>

		<!-- 手機：漢堡折疊選單 -->
		<div class="md:hidden">

			<div class="flex items-center justify-between">
				<RouterLink to="/" class="block">
					<img src="/logo.png" alt="Logo" class="h-10 w-10" />
				</RouterLink>

				<button
					type="button"
					class="mx-auto flex items-center gap-2 rounded-md border border-stone-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-emerald-500/15 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-emerald-400/10"
					:aria-expanded="mobileOpen"
					aria-label="切換導航選單"
					@click="mobileOpen = !mobileOpen"
				>
					<svg
						v-if="!mobileOpen"
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
					<svg
						v-else
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
					</svg>
					<span>選單</span>
				</button>
			</div>

			<nav
				v-if="mobileOpen"
				class="mt-2 flex flex-col rounded-md border border-stone-200 bg-stone-50 p-2 text-left shadow-md dark:border-zinc-700 dark:bg-zinc-900"
			>
				<template v-for="item in navItems" :key="item.label">
					<div v-if="isGroup(item)">
						<button
							type="button"
							:class="[
								mobileGroupButtonClass,
								isGroupActive(item) ? 'font-medium text-zinc-900 dark:text-zinc-100' : '',
							]"
							:aria-expanded="openGroup === item.label"
							@click="toggleGroup(item.label)"
						>
							<span>{{ item.label }}</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 transition-transform"
								:class="openGroup === item.label ? 'rotate-180' : ''"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						<div v-if="openGroup === item.label">
							<RouterLink
								v-for="child in item.children"
								:key="child.label"
								:to="child.to!"
								:class="mobileSubLinkClass"
								:exact-active-class="exactActiveClass"
							>
								{{ child.label }}
							</RouterLink>
						</div>
					</div>
					<a
						v-else-if="item.href"
						:href="item.href"
						target="_blank"
						rel="noopener"
						:class="mobileLinkClass"
					>
						{{ item.label }}
					</a>
					<RouterLink
						v-else
						:to="item.to!"
						:class="mobileLinkClass"
						:exact-active-class="exactActiveClass"
					>
						{{ item.label }}
					</RouterLink>
				</template>
			</nav>
		</div>
	</div>
</template>
