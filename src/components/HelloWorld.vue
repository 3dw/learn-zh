<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
	msg: string
}>()
</script>

<template>
	<div class="text-center lg:text-left">
		<RouterLink to="/">
			<h1
				class="relative -top-2.5 text-4xl font-semibold tracking-tight text-emerald-600 sm:text-[2.6rem] dark:text-emerald-400"
			>
				{{ msg }}
			</h1>
		</RouterLink>
		<h3 class="text-lg text-zinc-600 dark:text-zinc-300">
			單純想讓孩子好好講話
		</h3>
	</div>
</template>
