interface Env {
	SITUATIONS_KV: KVNamespace
	EDITOR_SECRET?: string
}

const KV_KEY = 'questions'

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		if (url.pathname === '/api/detect-image-zh') {
			return fetch(
				new Request('https://zh-en-backend.alearn13994229.workers.dev/detect-image-zh', {
					method: request.method,
					headers: request.headers,
					body: request.body,
				}),
			)
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
