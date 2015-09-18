import 'newrelic'
import express from 'express'
import artworks from 'artworks'
import d from 'debug'
import errorHandler from 'middleware/error'
import artsyXapp from 'artsy-xapp'
import morgan from 'morgan'
import proxyGravity from 'middleware/proxy-gravity'
let debug = d('app')
let { PORT, ARTSY_URL } = process.env

let app = express()

app.use(artworks)
app.use(errorHandler)
app.use(morgan('dev'))
app.use(proxyGravity)

artsyXapp.on('error', debug).init(() => {
  app.listen(PORT, () => debug(`Listening on ${PORT}`))
})
