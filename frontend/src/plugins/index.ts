/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

import { createPinia } from 'pinia'
// Plugins
import router from '../router'
import i18n from './i18n'
import vuetify from './vuetify'

const pinia = createPinia()

export async function registerPlugins (app: App) {
  app.use(pinia)
  app.use(vuetify)
  app.use(i18n)
  app.use(router)
}
