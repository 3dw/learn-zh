export default {
	async fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === '/api/detect-image-zh') {
			const proxyRequest = new Request(
				'https://zh-en-backend.alearn13994229.workers.dev/detect-image-zh',
				{
					method: request.method,
					headers: request.headers,
					body: request.body,
				},
			);
			return fetch(proxyRequest);
		}

		if (url.pathname.startsWith('/api/')) {
			return Response.json({ name: 'Cloudflare' });
		}

		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
