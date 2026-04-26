# 自主學中文（learn-zh）

## 這個專案是為誰設計的？

這個網站是為**想讓孩子自主學習中文的家長**所設計的。

### 真實使用情境

- 家長帶著孩子坐在電腦或平板前，孩子可以直接點進來自己操作
- 孩子看到一張圖片，想知道那個東西的中文怎麼唸、怎麼寫
- 孩子念三字經，不確定某個字的發音，想聽正確的台灣腔中文發音
- 孩子輸入一段中文，網站可以幫他念出來，練習聽力

### 目前提供的功能

- **自訂朗讀（Custom TTS）**：輸入中文文字，網站幫你念出來（台灣腔）
- **三字經練習**：配合語音替換，練習古典中文發音
- **圖片辨識**：拍照或上傳圖片，自動回傳中英文標籤並朗讀

### 未來發展方向

- 更多適合兒童的中文學習場景
- 擴充詞彙練習、字卡功能
- 結合家長端紀錄，追蹤孩子的學習進度

### 20260416新增
- 讓小孩看到圖片，可以正確解讀（例如：這個人在生氣）
- 讓小孩可以進一步理解圖片內容（例如：這兩個人很開心的在公園打球）
- 讓小孩可以正確對答（例如：在別人讚美你的時候，要回答謝謝）

---

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### 測試不包含API端點服務的網頁(Hot-reload)

```sh
npm run dev
```

### 測試包含API端點服務的網頁 

```sh 
npm run preview
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```


### Deploy this project

```sh
npm run deploy
```