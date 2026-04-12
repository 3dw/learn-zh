import { computed, ref } from 'vue'
import { getPreferredZhTwFemaleVoice, getVoicesAsync } from '@/utils/speechVoice'

type ClientPlatform = 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'chromeos' | 'unknown'

const ttsSupported = ref(false)
const zhTwVoiceAvailable = ref(false)
const detectedPlatform = ref<ClientPlatform>('unknown')
const speechAvailabilityChecked = ref(false)

let initialized = false

function detectPlatform(): ClientPlatform {
  if (typeof navigator === 'undefined') return 'unknown'

  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const userAgentDataPlatform = nav.userAgentData?.platform?.toLowerCase() ?? ''
  const platform = navigator.platform?.toLowerCase() ?? ''
  const userAgent = navigator.userAgent.toLowerCase()
  const combined = `${userAgentDataPlatform} ${platform} ${userAgent}`

  if (
    combined.includes('iphone') ||
    combined.includes('ipad') ||
    combined.includes('ipod') ||
    combined.includes('ios')
  ) {
    return 'ios'
  }
  if (combined.includes('mac')) return 'macos'
  if (combined.includes('android')) return 'android'
  if (combined.includes('cros')) return 'chromeos'
  if (combined.includes('win')) return 'windows'
  if (combined.includes('linux')) return 'linux'
  return 'unknown'
}

async function refreshSpeechAvailability() {
  if (typeof window === 'undefined') return

  ttsSupported.value = 'speechSynthesis' in window
  detectedPlatform.value = detectPlatform()

  if (!ttsSupported.value) {
    zhTwVoiceAvailable.value = false
    speechAvailabilityChecked.value = true
    return
  }

  const voices = await getVoicesAsync()
  zhTwVoiceAvailable.value = getPreferredZhTwFemaleVoice(voices) !== null
  speechAvailabilityChecked.value = true
}

export function useSpeechAvailability() {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true
    void refreshSpeechAvailability()

    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', refreshSpeechAvailability)
    }
  }

  const voicePlaybackAvailable = computed(() => ttsSupported.value && zhTwVoiceAvailable.value)
  const voicePlaybackBlocked = computed(
    () => speechAvailabilityChecked.value && !voicePlaybackAvailable.value,
  )

  return {
    ttsSupported,
    zhTwVoiceAvailable,
    voicePlaybackAvailable,
    voicePlaybackBlocked,
    speechAvailabilityChecked,
    detectedPlatform,
    refreshSpeechAvailability,
  }
}
