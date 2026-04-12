<script setup lang="ts">
import { computed } from 'vue'
import { useSpeechAvailability } from '@/composables/useSpeechAvailability'

const { detectedPlatform } = useSpeechAvailability()

const guide = computed(() => {
  switch (detectedPlatform.value) {
    case 'windows':
      return {
        title: 'Windows 安裝華語語音',
        steps: [
          '開啟「設定」>「時間與語言」>「語言與地區」。',
          '在慣用語言中加入「中文（台灣）」；若已存在，點進該語言的選項頁。',
          '在語言功能中安裝「語音」或「Text-to-speech」。',
          '安裝完成後重新開啟 Chrome 或 Edge，再回到本站測試。',
        ],
      }
    case 'macos':
      return {
        title: 'macOS 安裝華語語音',
        steps: [
          '開啟「系統設定」>「輔助使用」>「朗讀內容」。',
          '在系統聲音或 Voice 區域新增中文語音，優先選台灣中文相關聲音。',
          '若看到下載按鈕，先完成語音下載。',
          '重新開啟瀏覽器後回到本站測試。',
        ],
      }
    case 'ios':
      return {
        title: 'iPhone / iPad 安裝華語語音',
        steps: [
          '開啟「設定」>「輔助使用」>「朗讀內容」>「聲音」。',
          '選擇「中文」並下載台灣中文或華語相關聲音。',
          '安裝後重新開啟 Safari 或 Chrome。',
          '回到本站後再試一次語音播放。',
        ],
      }
    case 'android':
      return {
        title: 'Android 安裝華語語音',
        steps: [
          '開啟手機「設定」並搜尋「文字轉語音」或「Text-to-speech」。',
          '進入 Google 文字轉語音輸出或裝置的 TTS 設定。',
          '下載或啟用中文（台灣）/ 華語語音資料。',
          '重新開啟瀏覽器並返回本站測試。',
        ],
      }
    case 'chromeos':
      return {
        title: 'ChromeOS 安裝華語語音',
        steps: [
          '開啟「設定」>「進階」>「無障礙設定」。',
          '找到文字轉語音相關設定並啟用語音功能。',
          '下載或加入中文（台灣）語音。',
          '重新啟動瀏覽器分頁後回到本站測試。',
        ],
      }
    case 'linux':
      return {
        title: 'Linux 設定華語語音',
        steps: [
          '先確認目前桌面環境或瀏覽器使用的 TTS 引擎是什麼。',
          '安裝可供瀏覽器存取的中文（台灣）語音套件或語音引擎。',
          '若是 Chromium / Chrome，安裝後請完整重開瀏覽器。',
          '回到本站測試；若仍無語音，建議改用 Chrome 或 Edge on Windows / macOS。',
        ],
      }
    default:
      return {
        title: '安裝華語語音',
        steps: [
          '請先確認目前瀏覽器支援 Web Speech API，建議使用最新版 Chrome、Edge 或 Safari。',
          '在作業系統的語言或輔助使用設定中，安裝中文（台灣）或華語語音。',
          '安裝後完整重新開啟瀏覽器，再回到本站測試。',
        ],
      }
  }
})
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 pb-12 pt-6">
    <header class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/30">
      <p class="m-0 text-sm font-medium text-amber-900 dark:text-amber-100">語音安裝說明</p>
      <h1 class="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {{ guide.title }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        本頁會依照你目前的作業系統提供安裝方向。完成安裝後，請重新開啟瀏覽器，讓新的語音資料被載入。
      </p>
    </header>

    <section class="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <ol class="m-0 list-decimal space-y-3 pl-5 text-zinc-800 dark:text-zinc-100">
        <li v-for="step in guide.steps" :key="step">{{ step }}</li>
      </ol>
    </section>

    <section class="mt-5 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-5 text-sm leading-6 text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
      <p class="m-0">如果你已安裝語音但本站仍顯示不可用，通常是瀏覽器尚未重新載入語音清單。</p>
      <p class="mb-0 mt-2">建議操作：關閉所有本站分頁、完整重開瀏覽器，再重新進入。</p>
    </section>
  </section>
</template>
