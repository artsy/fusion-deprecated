express = require 'express'
fetchUntilEnd = require 'fetch_until_end'
db = require 'db'
{ fabricate2, server } = require 'antigravity'

describe 'fetchUntilEnd', ->

  before (done) ->
    @server = server.listen 5000, -> done()

  after ->
    @server.close()

  it 'fetches & stores a resource until its finished', (done) ->
    fetchUntilEnd 'partners', ->
      db.apiv2_partners.find {}, (err, partners) ->
        partners[0].name.should.equal 'Gagosian Gallery'
        done()
