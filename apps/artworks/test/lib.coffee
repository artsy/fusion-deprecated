db = require 'db'
gravity = require('antigravity').server
{ fetchAndCacheArtwork } = require '../lib'

describe 'fetchAndCacheArtwork', ->

  before (done) ->
    @server = gravity.listen 5000, -> done()

  after ->
    @server.close()

  it 'fetches related artwork data and combines it into one blob', (done) ->
    fetchAndCacheArtwork 'andy-warhol-skull', (err, artwork) ->
      artwork.artists[0].name.should.equal 'Andy Warhol'
      done()

  it 'caches artwork for speedy returns', (done) ->
    fetchAndCacheArtwork 'andy-warhol-skull', (err, artwork) ->
      db.artworks.update { _id: artwork._id }, { foo: 'bar' }
      fetchAndCacheArtwork 'andy-warhol-skull', (err, artwork) ->
        done()
