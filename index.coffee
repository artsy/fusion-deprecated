express = require 'express'
request = require 'superagent'
debug = require('debug') 'app'
{ ARTSY_URL, PORT } = process.env

app = module.exports = express()

# Mount apps
app.use require './apps/partners'
app.use require './apps/artworks'

app.listen PORT, -> debug "Listening on #{PORT}"