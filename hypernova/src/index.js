import hypernova from 'hypernova/server'
import { renderVue, Vue } from 'hypernova-vue'
import express from 'express'
import path from 'path'

import Home from './components/Home.vue'
import NavBar from './components/NavBar.vue'

hypernova({
  devMode: process.env.NODE_ENV !== 'production',
  getComponent (name, context) {
    if (name === 'Home') {
      return renderVue(name, Vue.extend(Home))
    }

    if (name === 'NavBar') {
      return renderVue(name, Vue.extend(NavBar))
    }
  },
  port: process.env.PORT || 3000,

  createApplication () {
    const app = express()

    app.get('/', (req, res) => res.status(200).json('OK'))

    app.use('/public', express.static(path.join(process.cwd(), 'dist')))

    return app
  }
})
