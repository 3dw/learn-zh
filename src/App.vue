<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header class="app-header">
    <div class="wrapper">
      <HelloWorld msg="自主學中文" />
      <nav>
        <RouterLink to="/">首頁</RouterLink>
        <RouterLink to="/custom">自訂朗讀</RouterLink>
        <RouterLink to="/three-character">三字經</RouterLink>
        <RouterLink to="/what-is-this">AI 圖片學</RouterLink>
        <RouterLink to="/bannan-line-quiz">捷運站名</RouterLink>
        <RouterLink to="/about">關於</RouterLink>
      </nav>
    </div>
  </header>

  <main class="app-content">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  line-height: 1.4;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 0.75rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

button {
  background-color: hsla(160, 100%, 37%, 1);
  color: var(--color-background);
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  margin: 1rem 0 0.5rem 0;
}

.app-content {
  width: 100%;
}

</style>
