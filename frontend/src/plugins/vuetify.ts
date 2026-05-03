/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components'
import '@mdi/font/css/materialdesignicons.css'
import '../styles/layers.css'
import 'vuetify/styles'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ThemeName = 'sportLight' | 'sportDark'

export const themeModeStorageKey = 'sportconnect-theme-mode'
const legacyThemeStorageKey = 'sportconnect-theme'

const lightTheme = {
  dark: false,
  colors: {
    'background': '#f7f9fb',
    'surface': '#ffffff',
    'primary': '#ff6b00',
    'on-primary': '#ffffff',
    'primary-darken-1': '#a04100',
    'secondary': '#565e74',
    'tertiary': '#505f76',
    'error': '#ba1a1a',
    'info': '#0ea5e9',
    'success': '#16a34a',
    'warning': '#f59e0b',
    'on-background': '#191c1e',
    'on-surface': '#191c1e',
    'surface-variant': '#eceef0',
    'on-surface-variant': '#565e74',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    'background': '#0f172a',
    'surface': '#111827',
    'primary': '#ff8a3d',
    'on-primary': '#1f130a',
    'primary-darken-1': '#ff6b00',
    'secondary': '#94a3b8',
    'tertiary': '#64748b',
    'error': '#f87171',
    'info': '#38bdf8',
    'success': '#22c55e',
    'warning': '#f59e0b',
    'on-background': '#f8fafc',
    'on-surface': '#f8fafc',
    'surface-variant': '#1f2937',
    'on-surface-variant': '#cbd5e1',
  },
}

function systemPrefersDark () {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function getStoredThemeMode (): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedMode = window.localStorage.getItem(themeModeStorageKey)
  if (storedMode === 'system' || storedMode === 'light' || storedMode === 'dark') {
    return storedMode
  }

  const legacyStoredTheme = window.localStorage.getItem(legacyThemeStorageKey)
  if (legacyStoredTheme === 'sportDark') {
    return 'dark'
  }
  if (legacyStoredTheme === 'sportLight') {
    return 'light'
  }

  return null
}

export function resolveThemeName (mode: ThemeMode): ThemeName {
  if (mode === 'light') {
    return 'sportLight'
  }
  if (mode === 'dark') {
    return 'sportDark'
  }
  return systemPrefersDark() ? 'sportDark' : 'sportLight'
}

export function resolveInitialThemeMode (): ThemeMode {
  return getStoredThemeMode() ?? 'system'
}

export function setThemeModePreference (mode: ThemeMode) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(themeModeStorageKey, mode)
  window.localStorage.setItem(legacyThemeStorageKey, resolveThemeName(mode))
}

export function applyDocumentColorScheme (themeName: ThemeName) {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.style.colorScheme = themeName === 'sportDark' ? 'dark' : 'light'
}

const initialThemeMode = resolveInitialThemeMode()
const initialThemeName = resolveThemeName(initialThemeMode)
applyDocumentColorScheme(initialThemeName)

export default createVuetify({
  aliases: {
    VBtnPrimary: VBtn,
    VBtnSecondary: VBtn,
    VBtnGhost: VBtn,
  },
  defaults: {
    VBtn: {
      class: 'text-none',
    },
    VBtnPrimary: {
      color: 'primary',
      baseColor: 'primary',
      variant: 'flat',
      rounded: 'pill',
      size: 'large',
      class: 'font-bold',
      style: 'background: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary));',
    },
    VBtnSecondary: {
      color: 'primary',
      variant: 'tonal',
      rounded: 'pill',
      size: 'large',
      class: 'font-semibold',
    },
    VBtnGhost: {
      color: 'primary',
      variant: 'text',
      class: 'font-semibold',
    },
    VTextField: {
      class: '[font-family:var(--font-body)]',
      color: 'primary',
      density: 'comfortable',
      bgColor: 'surface',
      flat: true,
      hideDetails: 'auto',
      rounded: 'xl',
      variant: 'solo-filled',
    },
    VSelect: {
      class: '[font-family:var(--font-body)]',
      color: 'primary',
      density: 'comfortable',
      bgColor: 'surface',
      hideDetails: 'auto',
      rounded: 'xl',
      variant: 'outlined',
    },
    VTextarea: {
      class: '[font-family:var(--font-body)]',
      color: 'primary',
      density: 'comfortable',
      bgColor: 'surface',
      hideDetails: 'auto',
      rounded: 'xl',
      variant: 'outlined',
    },
    VSwitch: {
      color: 'primary',
      hideDetails: true,
      inset: true,
    },
    VRating: {
      color: 'primary',
    },
  },
  theme: {
    defaultTheme: initialThemeName,
    themes: {
      sportLight: lightTheme,
      sportDark: darkTheme,
    },
    utilities: false,
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },
})
