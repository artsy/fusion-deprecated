express = require 'express'
{ fabricate2, server } = require 'antigravity'
{ imageUrls } = require 'apiv2_helpers'

app = express()
app.use '/__gravity', require('antigravity').server

describe 'APIv2 Helpers', ->

  beforeEach (done) ->
    @server = app.listen 5000, =>
      done()

  afterEach ->
    @server.close()

  describe '#imageUrls', ->

    it 'it maps curies into image urls', ->
      imageUrls(fabricate2('artwork')).large.should.containEql 'large.jpg'

    it 'it prefers the thumbnail base url b/c its more reliable', ->
      artwork = fabricate2('artwork')
      artwork._links.thumbnail.href = 'http://foo.com/bar/baz.jpg'
      imageUrls(artwork).large.should.equal 'http://foo.com/bar/large.jpg'
