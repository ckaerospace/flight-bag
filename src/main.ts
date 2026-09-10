import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './style.css'
import { boot } from './app.ts'

const root = document.querySelector<HTMLElement>('#app')
if (!root) {
  throw new Error('Missing #app')
}
boot(root)
