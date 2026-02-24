<template>
  <div class="what-is-this-page">
    <div class="word-card-list">
      <h1>AI 圖片學英文/中文</h1>

      <!-- 上傳圖片區域 -->
      <div class="upload-section">
        <div class="camera-buttons">
          <button type="button" class="btn btn-primary" @click="openCamera">
            使用相機拍照
          </button>

          <label class="file-label">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.heic,.heif"
              class="file-input"
              @change="onFileChange"
            />
            上傳圖片
          </label>
        </div>

        <!-- 相機預覽 -->
        <video
          v-show="showCamera"
          ref="videoRef"
          autoplay
          playsinline
          class="camera-preview"
        ></video>

        <!-- 拍照按鈕 -->
        <button
          v-if="showCamera"
          type="button"
          class="btn btn-primary"
          @click="takePhoto"
        >
          拍照
        </button>

        <!-- 預覽圖片 -->
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="預覽圖片" />
        </div>
      </div>

      <!-- 載入中提示 -->
      <div v-if="loading" class="text-center">
        <div class="spinner"></div>
        <p>正在分析圖片並產生學習句...</p>
      </div>

      <!-- 顯示 AI 描述結果 -->
      <div v-if="resultZh || resultEn" class="result-section">
        <h2 class="result-title">學習內容：</h2>
        <div class="result-card">
          <div class="result-zh">中文：{{ resultZh }}</div>
          <div class="result-en">英文原句：{{ resultEn }}</div>

          <div class="result-buttons">
            <button type="button" class="btn btn-primary" @click="playZhAudio">
              播放中文發音
            </button>
            <button type="button" class="btn btn-teal" @click="playEnAudio">
              播放英文發音
            </button>
            <button type="button" class="btn btn-pink" @click="saveToFavorites">
              存到最愛
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue'
import heic2any from 'heic2any'
import Pica from 'pica'
import {
  EN_US_PREFERRED_KEYWORDS,
  ZH_TW_PREFERRED_KEYWORDS,
  speakTextWithPreferredVoice,
} from '@/utils/speechVoice'

export default defineComponent({
  name: 'WhatIsThisPage',

  setup() {
    const FAVORITES_KEY = 'en_love_arr'
    const imagePreview = ref('')
    const loading = ref(false)
    const resultEn = ref('')
    const resultZh = ref('')
    const videoRef = ref<HTMLVideoElement | null>(null)
    const showCamera = ref(false)
    let stream: MediaStream | null = null

    const onFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) handleImageUpload(file)
      target.value = ''
    }

    const getFavorites = () => {
      try {
        const raw = localStorage.getItem(FAVORITES_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        console.error('讀取最愛失敗:', error)
        return []
      }
    }

    const blobToDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

    const createLowResImage = async () => {
      if (!imagePreview.value) return ''

      const previewResponse = await fetch(imagePreview.value)
      const sourceBlob = await previewResponse.blob()
      const imageElement = new Image()
      const imageLoaded = new Promise<void>((resolve, reject) => {
        imageElement.onload = () => resolve()
        imageElement.onerror = reject
      })
      imageElement.src = URL.createObjectURL(sourceBlob)
      await imageLoaded

      const canvas = document.createElement('canvas')
      const maxWidth = 320
      const targetWidth = Math.min(maxWidth, imageElement.width)
      const targetHeight = Math.max(
        1,
        Math.floor((targetWidth / imageElement.width) * imageElement.height),
      )
      canvas.width = targetWidth
      canvas.height = targetHeight

      const context = canvas.getContext('2d')
      if (!context) return ''
      context.drawImage(imageElement, 0, 0, targetWidth, targetHeight)

      let quality = 0.7
      let compressedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
      })

      const MAX_IMAGE_SIZE = 90 * 1024
      while (compressedBlob.size > MAX_IMAGE_SIZE && quality > 0.4) {
        quality -= 0.1
        compressedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
        })
      }

      return blobToDataUrl(compressedBlob)
    }

    const saveToFavorites = async () => {
      if (!resultEn.value || !resultZh.value) {
        window.alert('請先拍照或上傳圖片，產生中英文內容後再收藏')
        return
      }

      try {
        const favorites = getFavorites()
        const existingIndex = favorites.findIndex(
          (card: { english: string; chinese: string }) =>
            card.english === resultEn.value && card.chinese === resultZh.value,
        )

        const image = await createLowResImage()
        const favoriteCard = {
          english: resultEn.value,
          chinese: resultZh.value,
          ...(image ? { image } : {}),
        }

        if (existingIndex >= 0) {
          favorites[existingIndex] = {
            ...favorites[existingIndex],
            ...favoriteCard,
          }
          window.alert('已更新最愛中的字卡')
        } else {
          favorites.push(favoriteCard)
          window.alert('已加入最愛')
        }

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('儲存最愛失敗:', error)
        window.alert('儲存最愛失敗，請稍後再試')
      }
    }

    const handleImageUpload = async (file: File) => {
      if (!file) return

      const MAX_FILE_SIZE = 1.5 * 1024 * 1024

      let processedFile = file
      const isHeic = /\.(heic|HEIC|heif|HEIF)$/.test(file.name)

      if (isHeic) {
        try {
          const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.95,
          })

          const resultBlob = Array.isArray(blob) ? blob[0] : blob
          if (!resultBlob) return

          processedFile = new File(
            [resultBlob],
            file.name.replace(/\.(heic|HEIC|heif|HEIF)$/, '.jpg'),
            { type: 'image/jpeg' },
          )
        } catch (heicError: unknown) {
          if ((heicError as Error).message.includes('already browser readable')) {
            processedFile = file
          } else {
            console.error('HEIC 轉換錯誤:', heicError)
            window.alert('HEIC 圖片轉換失敗，請重試')
            return
          }
        }
      }

      if (processedFile.size > MAX_FILE_SIZE) {
        try {
          const img = new Image()
          const imgLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img)
            img.onerror = reject
          })

          img.src = URL.createObjectURL(processedFile)
          await imgLoadPromise

          let width = img.width
          let height = img.height
          const aspectRatio = width / height
          let scale = 0.8

          const canvas = document.createElement('canvas')
          const pica = new Pica({ features: ['js', 'wasm', 'cib'] })

          let attempts = 0
          let compressedBlob: Blob

          do {
            width = Math.floor(img.width * scale)
            height = Math.floor(width / aspectRatio)

            canvas.width = width
            canvas.height = height

            await pica.resize(img, canvas, {
              quality: 3,
              unsharpAmount: 80,
              unsharpRadius: 0.6,
              unsharpThreshold: 2,
            })

            compressedBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
            })

            scale *= 0.9
            attempts++
          } while (compressedBlob.size > MAX_FILE_SIZE && attempts < 5)

          processedFile = new File([compressedBlob], processedFile.name, {
            type: 'image/jpeg',
          })
        } catch (error) {
          console.error('圖片壓縮失敗:', error)
          window.alert('圖片壓縮失敗，請重試')
          return
        }
      }

      imagePreview.value = URL.createObjectURL(processedFile)

      loading.value = true
      resultEn.value = ''
      resultZh.value = ''

      try {
        const formData = new FormData()
        formData.append('image', processedFile)

        const response = await fetch(
          'https://zh-en-backend.alearn13994229.workers.dev/detect-image-zh',
          {
            method: 'POST',
            body: formData,
          },
        )
        const data = await response.json()

        resultEn.value = data.descriptionEn || ''
        resultZh.value = data.descriptionZh || data.description || ''
      } catch (error) {
        console.error('上傳圖片失敗:', error)
      } finally {
        loading.value = false
      }
    }

    const playZhAudio = () => {
      speakTextWithPreferredVoice(resultZh.value, 'zh-TW', ZH_TW_PREFERRED_KEYWORDS, 0.72)
    }

    const playEnAudio = () => {
      speakTextWithPreferredVoice(resultEn.value, 'en-US', EN_US_PREFERRED_KEYWORDS)
    }

    const openCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })

        if (videoRef.value) {
          videoRef.value.srcObject = stream
          showCamera.value = true
        }
      } catch (error) {
        console.error('無法存取相機:', error)
        window.alert('無法存取相機，請確認權限設定')
      }
    }

    const takePhoto = () => {
      if (!videoRef.value || !stream) return

      const canvas = document.createElement('canvas')
      canvas.width = videoRef.value.videoWidth
      canvas.height = videoRef.value.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(videoRef.value, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (!blob) return

          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
          handleImageUpload(file)

          if (stream) {
            stream.getTracks().forEach((track) => track.stop())
            stream = null
          }
          showCamera.value = false
        },
        'image/jpeg',
        0.95,
      )
    }

    onUnmounted(() => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    })

    return {
      imagePreview,
      loading,
      resultEn,
      resultZh,
      onFileChange,
      playZhAudio,
      playEnAudio,
      videoRef,
      showCamera,
      openCamera,
      takePhoto,
      saveToFavorites,
    }
  },
})
</script>

<style scoped>
.what-is-this-page {
  padding: 1rem;
  background-color: #f4f1eb;
  font-size: 1.1rem;
}

.word-card-list {
  max-width: 1000px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.upload-section {
  text-align: center;
  margin-bottom: 1rem;
}

.camera-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.file-label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.file-input {
  display: none;
}

.camera-preview {
  width: 100%;
  max-width: 300px;
  margin: 0 auto 1rem;
  border-radius: 8px;
  display: block;
}

.image-preview {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.image-preview img {
  max-width: 200px;
  border-radius: 8px;
}

.text-center {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 3em;
  height: 3em;
  margin: 0 auto 1rem;
  border: 3px solid #eee;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-section {
  max-width: 600px;
  margin: 2rem auto 0;
}

.result-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.result-card {
  padding: 1rem;
  margin-top: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
}

.result-zh {
  margin-bottom: 0.5rem;
}

.result-en {
  color: #666;
  margin-bottom: 1rem;
}

.result-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-teal {
  background: #00897b;
  color: white;
}

.btn-pink {
  background: #e91e63;
  color: white;
}
</style>
