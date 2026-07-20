import { createI18n } from 'vue-i18n'
import en from '@/lang/en.json'

const i18n = createI18n({
  legacy: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: en
  }
})

/**
 * @param {String} locale
 */
export async function loadMessages (locale) {
  if (Object.keys(i18n.global.getLocaleMessage(locale)).length === 0) {
    try {
      const messages = await import(/* @vite-ignore */ `../lang/${locale}.json`)
      i18n.global.setLocaleMessage(locale, messages.default || messages)
    } catch (e) {
      console.warn(`Failed to load messages for locale: ${locale}`, e)
    }
  }

  if (i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale
  }
}

// Make loadMessages available on i18n instance for convenience
i18n.loadMessages = loadMessages

export default i18n
