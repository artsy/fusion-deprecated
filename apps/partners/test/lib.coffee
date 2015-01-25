db = require 'db'
_ = require 'underscore'
{ featuredGalleries } = require 'fixtures'
{ server } = require 'antigravity'
{ storeView } = require '../lib'

describe 'storeView', ->

  before (done) ->
    db.curations.insert {}, featuredGalleries, =>
      @server = server.listen 5000, -> done()

  after ->
    @server.close()

  xit 'stores combined data for a galleries index page', (done) ->
    storeView ->
      db.views.findOne { key: 'galleries_index' }, (err, data) ->
        _.findWhere(data.a_to_z, key: 'G').items[0].label.should
          .equal 'Gagosian Gallery'
        _.findWhere(data.featured_gallery_profiles, name: 'Gagosian Gallery')
          .href.should.containEql 'gagosian-gallery'
        done()
