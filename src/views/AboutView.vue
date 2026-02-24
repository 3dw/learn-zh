<template>
  <div class="about">
    <h1>關於本站</h1>
    <p>
      <strong>自主學中文</strong> 是一個開放、免費的中文自學平台，
      讓任何人都能隨時隨地透過聆聽、跟讀與 AI 輔助，輕鬆學習中文。
    </p>

    <h2>我們的理念</h2>
    <p>
      語言學習不應受限於時間與地點。我們相信，只要有好的工具與足夠的練習，
      每個人都能掌握台灣華文的基礎。
    </p>

    <h2>功能介紹</h2>
    <ul>
      <li><strong>自訂朗讀</strong> — 輸入任意中文，立即生成語音，反覆聆聽練習。</li>
      <li><strong>三字經</strong> — 以千年經典為素材，節奏感強，適合入門打底。</li>
      <li><strong>AI 圖片學</strong> — 拍下身邊物品，AI 即時告知中文名稱與用法。</li>
    </ul>

    <h2>技術資訊</h2>
    <p>
      本站以 <strong>Vue 3</strong> 開發，部署於 <strong>Cloudflare Workers</strong>，
      原始碼公開於 <a href="https://github.com/3dw/learn-zh" target="_blank" rel="noopener">GitHub</a>，
      歡迎貢獻與回饋。
    </p>
  </div>
</template>

<style scoped>
.about {
  max-width: 640px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  line-height: 1.8;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 2rem 0 0.5rem;
}

p, li {
  color: var(--color-text);
  font-size: 1rem;
}

ul {
  padding-left: 1.25rem;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: hsla(160, 100%, 37%, 1);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
