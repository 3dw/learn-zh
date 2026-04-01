export const ZH_TW_PREFERRED_KEYWORDS = ['Taiwan', 'zh-TW', 'Chinese (Taiwan)']
export const EN_US_PREFERRED_KEYWORDS = ['US', 'en-US', 'English (United States)']

export function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return resolve([])
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) return resolve(voices)
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      resolve(window.speechSynthesis.getVoices())
    }, { once: true })
  })
}

export function getPreferredVoice(
  lang: string,
  keywords: string[],
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const langPrefix = lang.split('-')[0] ?? lang
  const langMatch = voices.filter((v) => v.lang.startsWith(langPrefix) || v.lang === lang)
  for (const kw of keywords) {
    const found = langMatch.find((v) => v.name.includes(kw) || v.lang.includes(kw))
    if (found) return found
  }
  return langMatch[0] || null
}

/** 優先使用 lang 為 zh-TW 的語音，避免落到 zh-CN 等聽感較生硬或未校準的預設聲線。 */
export function getPreferredZhTwVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const twExact = voices.filter((v) => v.lang === 'zh-TW' || v.lang === 'zh_TW')
  const pool = twExact.length > 0 ? twExact : voices.filter((v) => v.lang.startsWith('zh'))
  if (pool.length === 0) return null
  for (const kw of ZH_TW_PREFERRED_KEYWORDS) {
    const found = pool.find((v) => v.name.includes(kw) || v.lang.includes(kw))
    if (found) return found
  }
  return pool[0] ?? null
}

export async function speakTextWithPreferredVoice(
  text: string,
  lang: string,
  keywords: string[],
  rate = 1,
): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return

  const voices = await getVoicesAsync()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate

  const preferred = getPreferredVoice(lang, keywords, voices)
  if (preferred) {
    utterance.voice = preferred
    utterance.lang = preferred.lang
  }

  window.speechSynthesis.speak(utterance)
}
