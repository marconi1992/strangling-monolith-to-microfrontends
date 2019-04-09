import { renderVue, Vue } from 'hypernova-vue'
import Home from '../src/components/Home.vue'

renderVue('Home', Vue.extend(Home))()
