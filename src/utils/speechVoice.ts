export const ZH_TW_PREFERRED_KEYWORDS = ['Taiwan', 'zh-TW', 'Chinese (Taiwan)']
export const ZH_TW_FEMALE_HINT_KEYWORDS = [
  'hsiao',
  'mei',
  'ting',
  'chia',
  'female',
  'woman',
  'xiao',
  'hsiaochen',
  'hsiaoyu',
  'xiaoyi',
]
const ZH_TW_MALE_HINT_KEYWORDS = ['yun-jhe', 'yunjhe', 'male', 'man', 'boy']
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

function includesKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw.toLowerCase()))
}

/** 優先使用 lang 為 zh-TW 的語音，避免落到 zh-CN 等聽感較生硬或未校準的預設聲線。 */
export function getPreferredZhTwVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return getPreferredZhTwFemaleVoice(voices)
}

/** 優先挑選台灣口音「女聲」，若裝置沒有女聲再退回一般 zh-TW。 */
export function getPreferredZhTwFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const twExact = voices.filter((v) => v.lang === 'zh-TW' || v.lang === 'zh_TW' || v.lang === 'cmn-TW')
  const pool = twExact.length > 0 ? twExact : voices.filter((v) => v.lang.startsWith('zh'))
  if (pool.length === 0) return null

  const sorted = [...pool].sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aLang = a.lang.toLowerCase()
    const bLang = b.lang.toLowerCase()

    const score = (name: string, lang: string) => {
      let s = 0
      if (lang === 'zh-tw' || lang === 'zh_tw' || lang === 'cmn-tw') s += 300
      else if (lang.startsWith('zh')) s += 100

      if (includesKeyword(`${name} ${lang}`, ZH_TW_PREFERRED_KEYWORDS)) s += 80
      if (includesKeyword(name, ZH_TW_FEMALE_HINT_KEYWORDS)) s += 120
      if (includesKeyword(name, ['natural', 'neural', 'siri'])) s += 40
      if (includesKeyword(name, ZH_TW_MALE_HINT_KEYWORDS)) s -= 80
      return s
    }

    return score(bName, bLang) - score(aName, aLang)
  })

  return sorted[0] ?? null
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

  const normalizedLang = lang.toLowerCase().replace('_', '-')
  const preferred =
    normalizedLang === 'zh-tw'
      ? getPreferredZhTwFemaleVoice(voices)
      : getPreferredVoice(lang, keywords, voices)
  if (preferred) {
    utterance.voice = preferred
    utterance.lang = preferred.lang
  }

  window.speechSynthesis.speak(utterance)
}
