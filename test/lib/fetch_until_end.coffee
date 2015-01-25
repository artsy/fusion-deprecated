express = require 'express'
fetchUntilEnd = require 'fetch_until_end'
db = require 'db'
{ fabricate2, server } = require 'antigravity'

describe 'fetchUntilEnd', ->

  beforeEach (done) ->
    i = 0
    app = express()
    app.post '/api/tokens/xapp_token', (req, res) ->
      res.send { token: 'foo' }
    app.get '/api/partners', (req, res) ->
      i++
      if i < 5
        json = {
          _embedded: { partners: [fabricate2('partner')] }
          _links: { next: href: '' }
        }
      else
        json = { _embedded: partners: [] }
      res.send json
    @server = app.listen 5000, -> done()

  afterEach ->
    @server.close()

  it 'fetches & stores a resource until its finished', (done) ->
    fetchUntilEnd 'partners', ->
      db.apiv2_partners.find {}, (err, partners) ->
        partners[0].name.should.equal 'Gagosian Gallery'
        done()
