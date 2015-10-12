import 'newrelic'
import express from 'express'
import artworks from 'artworks/index'
import d from 'debug'
import errorHandler from 'middleware/error'
import artsyXapp from 'artsy-xapp'
import morgan from 'morgan'
import proxyGravity from 'middleware/proxy-gravity'
import cors from 'cors'
import hsts from 'hsts'
import forceSSL from 'express-force-ssl'

let debug = d('app')
let { PORT, ARTSY_URL, NODE_ENV } = process.env
let app = express()

app.set('forceSSLOptions', { trustXFPHeader: true })
if (NODE_ENV == 'production') {
  app.use(forceSSL)
  app.use(hsts({ maxAge: 7776000000 })) // 90 days in ms
}
app.use(cors())
app.use(artworks)
app.use(errorHandler)
app.use(morgan('dev'))
app.use('/api/v1/artwork*', proxyGravity)

artsyXapp.on('error', debug).init(() => {
  app.listen(PORT, () => debug(`Listening on ${PORT}`))
})
