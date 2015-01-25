db = require 'db'
artsyXapp = require 'artsy_xapp'

@fetchAndCacheArtwork = (id, callback) ->
  db.artworks.findOne { $or: [{ id: id }, { slug: id }] }, (err, artwork) ->
    return callback err if err
    if artwork
      callback null, artwork
      callback = ->
    fetchArtwork id, (err, artwork) ->
      return callback err if err
      _.extend artwork, _id: ObjectId artwork._id
      db.artworks.save artwork, (err, artwork) ->
        callback err, artwork

@fetchArtwork = fetchArtwork = (id, callback) ->
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
            slug: _.last artwork._links.permalink.href.split('/')
            image_urls: imageUrls artwork
            artwork: artwork
            artists: artists._embedded.artists
            partner: partner
          callback null, data
