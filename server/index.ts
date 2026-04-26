interface Env {
	SITUATIONS_KV: KVNamespace
	EDITOR_SECRET?: string
	AI: {
		run: (model: string, input: unknown) => Promise<any>
	}
}

const KV_KEY = 'questions'

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		if (url.pathname === '/api/detect-image-zh') {
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					status: 204,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'POST, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type',
					},
				})
			}

			if (request.method !== 'POST') {
				return Response.json({ error: '只接受 POST 請求' }, { status: 405 })
			}

			try {
				const imageData = await parseImageFromRequest(request)
				if (!imageData || imageData.byteLength === 0) {
					return Response.json({ error: '未收到有效圖片資料' }, { status: 400 })
				}
				if (imageData.byteLength > 2 * 1024 * 1024) {
					return Response.json({ error: '圖片大小不能超過 2MB' }, { status: 413 })
				}

				const englishDescription = await describeImageInEnglish(imageData, env)
				const zhDescription = await translateEnToZh(englishDescription, env)

				return Response.json({
					description: zhDescription,
					descriptionEn: englishDescription,
					descriptionZh: zhDescription,
				})
			} catch (error) {
				const message = error instanceof Error ? error.message : '圖片辨識失敗'
				return Response.json({ error: message }, { status: 500 })
			}
		}

		if (url.pathname === '/api/situations/questions') {
			if (request.method === 'GET') {
				const raw = await env.SITUATIONS_KV.get(KV_KEY)
				return new Response(raw ?? '[]', {
					headers: { 'Content-Type': 'application/json' },
				})
			}

			if (request.method === 'POST') {
				const token = (request.headers.get('Authorization') ?? '').replace('Bearer ', '')
				if (!env.EDITOR_SECRET || token !== env.EDITOR_SECRET) {
					return new Response('Unauthorized', { status: 401 })
				}
				const body = await request.text()
				await env.SITUATIONS_KV.put(KV_KEY, body)
				return Response.json({ ok: true })
			}
		}

		if (url.pathname.startsWith('/api/')) {
			return Response.json({ name: 'Cloudflare' })
		}

		return new Response(null, { status: 404 })
	},
} satisfies ExportedHandler<Env>

interface ImageRequestPayload {
	image: string
}

async function parseImageFromRequest(request: Request): Promise<ArrayBuffer> {
	const contentType = request.headers.get('Content-Type') ?? ''

	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData()
		const imageFile = formData.get('image')
		if (!(imageFile instanceof File)) {
			throw new Error('請求必須包含 image 檔案欄位')
		}
		return imageFile.arrayBuffer()
	}

	if (contentType.includes('application/json')) {
		const payload = (await request.json()) as ImageRequestPayload
		if (!payload.image || typeof payload.image !== 'string') {
			throw new Error('JSON 請求必須包含 base64 圖片字串')
		}
		const base64 = payload.image.replace(/^data:image\/\w+;base64,/, '')
		return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)).buffer
	}

	if (contentType.includes('image/')) {
		return request.arrayBuffer()
	}

	throw new Error('不支援的 Content-Type，請使用 multipart/form-data 或 application/json')
}

function normalizeQuotedText(text: string): string {
	const normalized = text.trim()
	if (normalized.startsWith('"') && normalized.endsWith('"')) {
		return normalized.slice(1, -1).trim()
	}
	return normalized
}

async function describeImageInEnglish(imageBytes: ArrayBuffer, env: Env): Promise<string> {
	const input = {
		image: [...new Uint8Array(imageBytes)],
		prompt: 'Describe the image in one short, clear English sentence.',
	}
	const aiResponse = await env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', input)
	const description =
		typeof aiResponse?.description === 'string' ? aiResponse.description : JSON.stringify(aiResponse)
	const normalized = normalizeQuotedText(description)
	if (!normalized) {
		throw new Error('AI 回傳空白描述')
	}
	return normalized
}

async function translateEnToZh(text: string, env: Env): Promise<string> {
	try {
		const translated = await env.AI.run('@cf/meta/m2m100-1.2b', {
			text,
			source_lang: 'en',
			target_lang: 'zh',
		})
		const zhText =
			typeof translated?.translated_text === 'string'
				? translated.translated_text
				: typeof translated?.translation === 'string'
					? translated.translation
					: ''
		return zhText.trim() || text
	} catch {
		return text
	}
}
