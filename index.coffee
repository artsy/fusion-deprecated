express = require 'express'
httpProxy = require 'http-proxy'
request = require 'superagent'
debug = require('debug') 'app'
{ ARTSY_URL, PORT } = process.env

app = module.exports = express()

# Mount apps
app.use require './apps/partners'
app.use require './apps/artworks'

# Proxy the rest to Gravity
proxy = httpProxy.createProxyServer()
app.all '/api/v1*', (req, res) ->
  proxy.web req, res, target: ARTSY_URL
app.all '/api/*', (req, res) ->
  proxy.web req, res, target: ARTSY_URL

app.listen PORT, -> debug "Listening on #{PORT}"