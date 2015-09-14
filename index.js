import 'newrelic'
import express from 'express'
import artworks from 'artworks'
import d from 'debug'
import errorHandler from 'middleware/error'
let debug = d('app')

let { PORT } = process.env

let app = express()

app.use(artworks)
app.use(errorHandler)
app.listen(PORT, () => debug(`Listening on ${PORT}`))
