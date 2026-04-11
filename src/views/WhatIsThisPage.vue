<template>
	<div class="bg-stone-100 px-4 py-6 text-lg dark:bg-zinc-900">
		<div
			class="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm dark:border dark:border-zinc-800 dark:bg-zinc-950"
		>
			<h1 class="mb-4 font-bold text-zinc-900 dark:text-zinc-50">
				AI 圖片學英文/中文
			</h1>

			<div class="mb-4 text-center">
				<div class="mb-2 flex flex-wrap items-center justify-center gap-2.5">
					<button
						type="button"
						class="cursor-pointer rounded border-0 bg-emerald-500 px-4 py-2 text-base text-white transition hover:bg-emerald-600"
						@click="openCamera"
					>
						使用相機拍照
					</button>

					<label
						class="inline-block cursor-pointer rounded bg-emerald-500 px-4 py-2 text-base text-white transition hover:bg-emerald-600"
					>
						<input
							type="file"
							accept=".jpg,.jpeg,.png,.heic,.heif"
							class="hidden"
							@change="onFileChange"
						/>
						上傳圖片
					</label>
				</div>

				<video
					v-show="showCamera"
					ref="videoRef"
					autoplay
					playsinline
					class="mx-auto mb-4 block max-w-[300px] rounded-lg"
				/>

				<button
					v-if="showCamera"
					type="button"
					class="cursor-pointer rounded border-0 bg-emerald-500 px-4 py-2 text-base text-white transition hover:bg-emerald-600"
					@click="takePhoto"
				>
					拍照
				</button>

				<div v-if="imagePreview" class="mt-4 flex justify-center">
					<img :src="imagePreview" alt="預覽圖片" class="max-w-[200px] rounded-lg" />
				</div>
			</div>

			<div v-if="loading" class="py-8 text-center">
				<div
					class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-[3px] border-stone-200 border-t-emerald-500 dark:border-zinc-700 dark:border-t-emerald-400"
				/>
				<p class="text-zinc-600 dark:text-zinc-300">正在分析圖片並產生學習句...</p>
			</div>

			<div v-if="resultZh || resultEn" class="mx-auto mt-8 max-w-xl">
				<h2 class="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
					學習內容：
				</h2>
				<div
					class="mt-2 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
				>
					<div class="mb-2 text-zinc-900 dark:text-zinc-100">中文：{{ resultZh }}</div>
					<div class="mb-4 text-zinc-500 dark:text-zinc-400">英文原句：{{ resultEn }}</div>

					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							class="cursor-pointer rounded border-0 bg-emerald-500 px-4 py-2 text-base text-white transition hover:bg-emerald-600"
							@click="playZhAudio"
						>
							播放中文發音
						</button>
						<button
							type="button"
							class="cursor-pointer rounded border-0 bg-teal-600 px-4 py-2 text-base text-white transition hover:bg-teal-700"
							@click="playEnAudio"
						>
							播放英文發音
						</button>
						<button
							type="button"
							class="cursor-pointer rounded border-0 bg-pink-600 px-4 py-2 text-base text-white transition hover:bg-pink-700"
							@click="saveToFavorites"
						>
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
