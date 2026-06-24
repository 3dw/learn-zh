import { resolveHead } from '../src/heads'

/** Replace an element's text content (e.g. <title>). */
class SetContent {
	constructor(private readonly value: string) {}
	element(element: Element) {
		element.setInnerContent(this.value)
	}
}

/** Set an attribute on a matched element (e.g. <meta content="...">). */
class SetAttribute {
	constructor(
		private readonly attr: string,
		private readonly value: string,
	) {}
	element(element: Element) {
		element.setAttribute(this.attr, this.value)
	}
}

/**
 * Inject per-route <head> metadata server-side.
 *
 * The app is an SPA served from static assets; for every HTML navigation we
 * fetch index.html from the ASSETS binding and rewrite its title / description /
 * Open Graph / Twitter tags based on the request path, so crawlers and social
 * cards get the right metadata without shipping a full SSR runtime. The shared
 * table lives in src/heads.ts and is reused on the client for SPA navigation.
 */
export default {
	async fetch(request, env) {
		const url = new URL(request.url)

		if (url.pathname.startsWith('/api/')) {
			return Response.json({ name: 'Cloudflare' })
		}

		const response = await env.ASSETS.fetch(request)

		// Only rewrite HTML documents; serve assets (JS/CSS/images/...) untouched.
		const contentType = response.headers.get('content-type') ?? ''
		if (!contentType.includes('text/html')) return response

		const head = resolveHead(url.pathname)

		return new HTMLRewriter()
			.on('title', new SetContent(head.title))
			.on('meta[name="description"]', new SetAttribute('content', head.description))
			.on('meta[property="og:title"]', new SetAttribute('content', head.title))
			.on('meta[property="og:description"]', new SetAttribute('content', head.description))
			.on('meta[property="og:url"]', new SetAttribute('content', head.url))
			.on('meta[name="twitter:title"]', new SetAttribute('content', head.title))
			.on('meta[name="twitter:description"]', new SetAttribute('content', head.description))
			.on('link[rel="canonical"]', new SetAttribute('href', head.url))
			.transform(response)
	},
} satisfies ExportedHandler<Env>
