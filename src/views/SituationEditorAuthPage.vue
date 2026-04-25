<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const error = ref(false)
const shaking = ref(false)

const SESSION_KEY = 'situation-editor-auth'

onMounted(() => {
  if (sessionStorage.getItem(SESSION_KEY) === 'ok') {
    router.replace('/situations/editor')
  }
})

function submit() {
  if (password.value === '0102') {
    sessionStorage.setItem(SESSION_KEY, 'ok')
    router.push('/situations/editor')
  } else {
    error.value = true
    shaking.value = true
    password.value = ''
    setTimeout(() => { shaking.value = false }, 500)
  }
}
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="mb-3 text-4xl">🔒</div>
        <h1 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">題庫後台</h1>
        <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">請輸入密碼以繼續</p>
      </div>

      <div
        class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
        :class="{ 'animate-shake': shaking }"
      >
        <p class="mb-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          提示：小孩的生日，月日共四位數
        </p>

        <input
          v-model="password"
          type="password"
          inputmode="numeric"
          maxlength="10"
          placeholder="輸入密碼"
          autofocus
          class="mb-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-lg tracking-widest text-zinc-900 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          @keydown.enter="submit"
        />

        <p v-if="error" class="mb-3 text-center text-xs text-red-500">密碼錯誤，請再試一次</p>

        <button
          type="button"
          class="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
          @click="submit"
        >
          進入
        </button>

        <div class="mt-4 text-center">
          <a href="/situations" class="text-xs text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300">
            ← 返回情境識別互動題
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.45s ease;
}
</style>
