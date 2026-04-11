<script setup lang="ts">
import ZhFlashCards from '@/components/ZhFlashCards.vue'

const cards = [
  { chinese: '一、二、三、四、五、六、七、八、九、十', image: '/number/counting.webp' },
  { chinese: '一加一等於二。', image: '/number/addition.webp' },
  { chinese: '二乘以二等於四。', image: '/number/multiplication.webp' },
  { chinese: '十除以二等於五。', image: '/number/division.webp' },
  { chinese: '這個數字太大了。', image: '/number/big_number.webp' },
  { chinese: '請數到十。', image: '/number/count_to_ten.webp' },
  { chinese: '答案是多少？', image: '/number/answer.webp' },
  { chinese: '這題很簡單。', image: '/number/easy.webp' },
  { chinese: '我需要計算機。', image: '/number/calculator.webp' },
  { chinese: '這是百分之五十。', image: '/number/fifty_percent.webp' },
  { chinese: '總共是一百元。', image: '/number/total_hundred.webp' },
  { chinese: '現在是三點半。', image: '/number/time.webp' },
  { chinese: '這個數字是奇數。', image: '/number/odd.webp' },
  { chinese: '那是偶數。', image: '/number/even.webp' },
  { chinese: '請寫下這個數字。', image: '/number/write_number.webp' },
  { chinese: '這是正確答案。', image: '/number/correct_answer.webp' },
  { chinese: '我們來解這道數學題。', image: '/number/math_problem.webp' },
  { chinese: '這是小數點。', image: '/number/decimal.webp' },
  { chinese: '這是分數。', image: '/number/fraction.webp' },
  { chinese: '這是無限大。', image: '/number/infinity.webp' },
]
</script>

<template>
  <ZhFlashCards title="數字字卡" :cards="cards" />
</template>
