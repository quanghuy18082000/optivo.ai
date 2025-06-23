import { useThemeStore } from '@/stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()

  const toggleTheme = () => {
    themeStore.toggleTheme()
  }

  return {
    isDark: themeStore.$state.isDark,
    toggleTheme,
  }
}