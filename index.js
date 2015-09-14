import 'newrelic'
import express from 'express'
import artworks from 'artworks'
import d from 'debug'

let { PORT } = process.env
let debug = d('app')
let app = express()

app.use(artworks)

app.listen(PORT, () => debug(`Listening on ${PORT}`))
