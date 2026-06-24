import { resolveHead } from '@/heads'

/**
 * Update the document <head> on client-side (SPA) navigation.
 *
 * The Cloudflare Worker already renders the correct head for the *initial*
 * request (see server/index.ts). This keeps the title & social meta in sync
 * when the user navigates between routes without a full page load, reusing the
 * same metadata table (src/heads.ts) so the two never drift apart.
 */
function setAttr(selector: string, attr: 'content' | 'href', value: string): void {
	const el = document.head.querySelector(selector)
	if (el) el.setAttribute(attr, value)
}

export function applyHead(pathname: string): void {
	if (typeof document === 'undefined') return

	const head = resolveHead(pathname)
	document.title = head.title
	setAttr('meta[name="description"]', 'content', head.description)
	setAttr('meta[property="og:title"]', 'content', head.title)
	setAttr('meta[property="og:description"]', 'content', head.description)
	setAttr('meta[property="og:url"]', 'content', head.url)
	setAttr('meta[name="twitter:title"]', 'content', head.title)
	setAttr('meta[name="twitter:description"]', 'content', head.description)
	setAttr('link[rel="canonical"]', 'href', head.url)
}
