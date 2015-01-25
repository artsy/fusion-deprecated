express = require 'express'
{ fetchAndCacheArtwork } = require './lib'

app = module.exports = express()

app.get '/api/orchestration/artworks/:id', (req, res, next) ->
  fetchAndCacheArtwork req.params.id, (err, artwork) ->
    if err then next err else res.send artwork
