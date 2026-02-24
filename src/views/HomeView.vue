<script setup lang="ts">
import { RouterLink } from 'vue-router'

const features = [
  {
    to: '/custom',
    emoji: '🎙️',
    title: '自訂朗讀',
    desc: '輸入任何中文文字，立即聆聽標準發音。反覆練習、聽說並進，讓口語越來越自然。',
  },
  {
    to: '/three-character',
    emoji: '📖',
    title: '三字經',
    desc: '從千年經典出發，三字一句，朗朗上口。在節奏中感受漢字之美，奠定紮實的文化根基。',
  },
  {
    to: '/what-is-this',
    emoji: '🤖',
    title: 'AI 圖片學',
    desc: '拍下身邊的任何物品，AI 立刻告訴你中文怎麼說。生活即教室，隨時隨地都能學中文。',
  },
]
</script>

<template>
  <main class="home">
    <section class="hero">
      <div class="hero-emoji">🇹🇼</div>
      <h1>自主學中文</h1>
      <p class="tagline">用最直覺的方式，讓中文學習融入每一天</p>
    </section>

    <section class="features">
      <RouterLink
        v-for="f in features"
        :key="f.to"
        :to="f.to"
        class="feature-card"
      >
        <span class="feature-emoji">{{ f.emoji }}</span>
        <h2>{{ f.title }}</h2>
        <p>{{ f.desc }}</p>
        <span class="cta">開始 →</span>
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.home {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* Hero */
.hero {
  text-align: center;
  padding: 3rem 0 2.5rem;
}

.hero-emoji {
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 0.75rem;
}

.tagline {
  font-size: 1.15rem;
  color: var(--color-text);
  opacity: 0.75;
}

/* Feature cards */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.75rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text);
  background: var(--color-background-soft);
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  border-color: hsla(160, 100%, 37%, 0.8);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px hsla(160, 100%, 37%, 0.15);
}

.feature-emoji {
  font-size: 2rem;
}

.feature-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

.feature-card p {
  font-size: 0.95rem;
  line-height: 1.65;
  margin: 0;
  flex: 1;
}

.cta {
  font-size: 0.9rem;
  font-weight: 600;
  color: hsla(160, 100%, 37%, 1);
  margin-top: 0.5rem;
}
</style>
