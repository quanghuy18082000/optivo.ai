import { getCurrentInstance } from 'vue'

export function useI18nSwitch() {
  const { appContext } = getCurrentInstance()
  const i18n = appContext.config.globalProperties.$i18n

  const switchLanguage = () => {
    i18n.locale.value = i18n.locale.value === 'en' ? 'vi' : 'en'
  }

  return { switchLanguage }
}