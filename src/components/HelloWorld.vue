<script setup lang="ts">
defineProps<{
	msg: string
}>()
</script>

<template>
	<div class="text-center lg:text-left">
		<h1
			class="relative -top-2.5 text-4xl font-semibold tracking-tight text-emerald-600 sm:text-[2.6rem] dark:text-emerald-400"
		>
			{{ msg }}
		</h1>
		<h3 class="text-lg text-zinc-600 dark:text-zinc-300">
			聽、說、讀，隨時隨地開始你的華文之旅
		</h3>
	</div>
</template>
