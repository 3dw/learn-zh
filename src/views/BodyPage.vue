<script setup lang="ts">
import ZhFlashCards from '@/components/ZhFlashCards.vue'

const cards = [
  { chinese: '我身體很健康。', image: '/body/healthy.webp' },
  { chinese: '我的眼睛很明亮。', image: '/body/eyes.webp' },
  { chinese: '我的視力很好。', image: '/body/eyesight.webp' },
  { chinese: '我的聽力很敏銳。', image: '/body/hearing.webp' },
  { chinese: '我的牙齒很整齊。', image: '/body/teeth.webp' },
  { chinese: '我的手很靈活。', image: '/body/hands.webp' },
  { chinese: '我的腿很有力。', image: '/body/legs.webp' },
  { chinese: '我的背很挺直。', image: '/body/back.webp' },
  { chinese: '我的心跳很穩定。', image: '/body/heartbeat.webp' },
  { chinese: '我的肌肉很結實。', image: '/body/muscles.webp' },
  { chinese: '我的骨骼很強壯。', image: '/body/bones.webp' },
  { chinese: '我的肩膀很放鬆。', image: '/body/shoulders.webp' },
  { chinese: '我的皮膚很光滑。', image: '/body/skin.webp' },
  { chinese: '我的頭髮很亮麗。', image: '/body/hair.webp' },
  { chinese: '我的呼吸很順暢。', image: '/body/breathing.webp' },
  { chinese: '我的免疫力很強。', image: '/body/immunity.webp' },
  { chinese: '我的平衡感很好。', image: '/body/balance.webp' },
  { chinese: '我的反應很敏捷。', image: '/body/reflexes.webp' },
  { chinese: '我的體溫很正常。', image: '/body/temperature.webp' },
  { chinese: '我的睡眠很充足。', image: '/body/sleep.webp' },
]
</script>

<template>
  <ZhFlashCards title="身體健康字卡" :cards="cards" />
</template>
