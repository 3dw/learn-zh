<script setup lang="ts">
import ZhFlashCards from '@/components/ZhFlashCards.vue'

const cards = [
  { chinese: '早安，爸爸！', image: '/env1_at_home/good_morning_dad.webp' },
  { chinese: '早安，媽媽！', image: '/env1_at_home/good_morning_mom.webp' },
  { chinese: '今天是星期一，要開始學習的一週了。', image: '/env1_at_home/monday_learning_week.webp' },
  { chinese: '今天的功課是什麼？', image: '/env1_at_home/homework_today.webp' },
  { chinese: '我來做今天的早餐。', image: '/env1_at_home/make_breakfast.webp' },
  { chinese: '我們一起吃飯吧！', image: '/env1_at_home/eat_together.webp' },
  { chinese: '我在學英文，今天學了新單字。', image: '/env1_at_home/studying_english.webp' },
  { chinese: '我準備做菜，誰想幫忙？', image: '/env1_at_home/help_cooking.webp' },
  { chinese: '需要幫忙嗎？我可以幫你。', image: '/env1_at_home/need_help.webp' },
  { chinese: '午餐準備好了嗎？', image: '/env1_at_home/lunch_ready.webp' },
  { chinese: '我想上廁所。', image: '/env1_at_home/use_bathroom.webp' },
  { chinese: '你能幫我澆花嗎？', image: '/env1_at_home/water_plants.webp' },
  { chinese: '我在看電視，你要一起看嗎？', image: '/env1_at_home/watching_tv.webp' },
  { chinese: '我們一起去看電影吧！', image: '/env1_at_home/go_to_movies.webp' },
  { chinese: '今晚有什麼計劃嗎？', image: '/env1_at_home/plans_tonight.webp' },
  { chinese: '請幫我關掉燈。', image: '/env1_at_home/turn_off_lights.webp' },
  { chinese: '記得鎖門哦。', image: '/env1_at_home/lock_the_door.webp' },
  { chinese: '我去洗碗，等我一下。', image: '/env1_at_home/wash_dishes.webp' },
  { chinese: '我們去找奶奶吧。', image: '/env1_at_home/visit_grandma.webp' },
  { chinese: '晚安，祝你好夢！', image: '/env1_at_home/good_night.webp' },
]
</script>

<template>
  <ZhFlashCards title="在家情境字卡" :cards="cards" />
</template>
