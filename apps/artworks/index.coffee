express = require 'express'
db = require 'db'
async = require 'async'
request = require 'superagent'
_ = require 'underscore'
artsyXapp = require 'artsy_xapp'
{ ObjectId } = require 'mongojs'
{ imageUrls } = require 'apiv2_helpers'
{ fetchAndCacheArtwork } = require './lib'
{ ARTSY_URL } = process.env

app = module.exports = express()

app.get '/api/orchestration/artworks/:id', (req, res, next) ->
  fetchAndCacheArtwork req.params.id, (err, data) ->
    return next err if err
    res.send data

fetchArtwork = _.throttle fetchArtwork, 10000
