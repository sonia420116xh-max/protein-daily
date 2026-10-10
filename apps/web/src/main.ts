import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import 'vant/lib/index.css'
import './styles.css'
import App from './App.vue'
import router from './router'

registerSW({
  immediate: true,
  onRegisteredSW(_serviceWorkerUrl, registration) {
    if (!registration) return

    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') void registration.update()
    }

    checkForUpdate()
    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('focus', checkForUpdate)
  },
})

createApp(App).use(createPinia()).use(router).mount('#app')
