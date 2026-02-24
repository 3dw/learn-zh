export const ZH_TW_PREFERRED_KEYWORDS = ['Taiwan', 'zh-TW', 'Chinese (Taiwan)']
export const EN_US_PREFERRED_KEYWORDS = ['US', 'en-US', 'English (United States)']

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices()
}

export function getPreferredVoice(
  lang: string,
  keywords: string[],
): SpeechSynthesisVoice | null {
  const voices = getVoices()
  if (voices.length === 0) return null

  const langPrefix = lang.split('-')[0] ?? lang
  const langMatch = voices.filter((v) => v.lang.startsWith(langPrefix) || v.lang === lang)
  for (const kw of keywords) {
    const found = langMatch.find((v) => v.name.includes(kw) || v.lang.includes(kw))
    if (found) return found
  }
  return langMatch[0] || null
}

export function speakTextWithPreferredVoice(
  text: string,
  lang: string,
  keywords: string[],
  rate = 1,
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate

  const preferred =
    lang.startsWith('zh') ? getPreferredVoice(lang, keywords) : getPreferredVoice(lang, keywords)
  if (preferred) {
    utterance.voice = preferred
    utterance.lang = preferred.lang
  }

  window.speechSynthesis.speak(utterance)
}
