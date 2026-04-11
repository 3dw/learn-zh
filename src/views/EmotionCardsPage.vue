<script setup lang="ts">
import ZhFlashCards from '@/components/ZhFlashCards.vue'

const cards = [
  { chinese: '我很開心！', image: '/images/emotions/happy.webp' },
  { chinese: '我很難過。', image: '/images/emotions/sad.webp' },
  { chinese: '我生氣了！', image: '/images/emotions/angry.webp' },
  { chinese: '我很緊張。', image: '/images/emotions/nervous.webp' },
  { chinese: '我很興奮！', image: '/images/emotions/excited.webp' },
  { chinese: '我很累。', image: '/images/emotions/tired.webp' },
  { chinese: '我很睏。', image: '/images/emotions/sleepy.webp' },
  { chinese: '我餓了。', image: '/images/emotions/hungry.webp' },
  { chinese: '我渴了。', image: '/images/emotions/thirsty.webp' },
  { chinese: '我很不舒服。', image: '/images/emotions/not_feeling_well.webp' },
  { chinese: '我很專注。', image: '/images/emotions/focused.webp' },
  { chinese: '我會分心。', image: '/images/emotions/distracted.webp' },
  { chinese: '我很放心。', image: '/images/emotions/relieved.webp' },
  { chinese: '我很平靜。', image: '/images/emotions/calm.webp' },
  { chinese: '我很煩躁。', image: '/images/emotions/irritated.webp' },
  { chinese: '我很擔心。', image: '/images/emotions/worried.webp' },
  { chinese: '我很害怕。', image: '/images/emotions/scared.webp' },
  { chinese: '我很驚訝！', image: '/images/emotions/surprised.webp' },
  { chinese: '我很無聊。', image: '/images/emotions/bored.webp' },
  { chinese: '我很放鬆。', image: '/images/emotions/relaxed.webp' },
]
</script>

<template>
  <ZhFlashCards title="情緒字卡" :cards="cards" />
</template>
