express = require 'express'
db = require 'db'
async = require 'async'
request = require 'superagent'
_ = require 'underscore'
artsyXapp = require 'artsy_xapp'
{ ObjectId } = require 'mongojs'
{ imageUrls } = require 'api_v2_helpers'
{ ARTSY_URL } = process.env

app = module.exports = express()

app.get '/api/orchestration/artworks/:id', (req, res, next) ->
  fetchArtwork req.params.id, (err, data) ->
    return next err if err
    res.send data

fetchAndCacheArtwork = (id, callback) ->
  db.artworks.findOne { _id: ObjectId(id) }, (err, artwork) ->
    return callback err if err
    if doc
      callback null, artwork
      callback = ->
    fetchArtwork id, (err, artwork) ->
      return callback err if err
      db.artworks.save _.extend(artwork, _id: ObjectId artwork._id), (err, artwork) ->
      callback null, artwork


fetchArtwork = (id, callback) ->
  artsyXapp (err, xappToken) ->
    return callback err if err
    request
      .get("#{ARTSY_URL}/api/artworks/#{id}")
      .set('X-Xapp-Token': xappToken)
      .end (err, res) ->
        artwork = res.body
        return callback err if err
        return callback() unless artwork?
        async.parallel [
          (cb) ->
            request
              .get(artwork._links.partner.href)
              .set('X-Xapp-Token': xappToken)
              .end (err, res) -> cb err, res.body
          (cb) ->
            request
              .get(artwork._links.artists.href)
              .set('X-Xapp-Token': xappToken)
              .end (err, res) -> cb err, res.body
        ], (err, [partner, artists]) ->
          return callback err if err
          data =
            _id: artwork.id
            image_urls: imageUrls artwork
            artwork: artwork
            artists: artists._embedded.artists
            partner: partner
          callback null, data
