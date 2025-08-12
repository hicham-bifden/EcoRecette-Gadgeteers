// @ts-ignore
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { IonicVue } from '@ionic/vue'

// Firebase
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './firebase/config'

// Pinia
import { createPinia } from 'pinia'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia())
  .use(VueFire, {
    firebaseApp,
    modules: [VueFireAuth()]
  })

router.isReady().then(() => {
  app.mount('#app')
})