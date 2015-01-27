db = require 'db'
async = require 'async'
fetchUntilEnd = require 'fetch_until_end'
artsyXapp = require 'artsy_xapp'
aToZ = require 'a_to_z'
request = require 'superagent'
_ = require 'underscore'
{ ARTSY_URL } = process.env

@storeView = (callback) ->
  artsyXapp (err, xappToken) ->
    return callback err if err
    async.parallel [
      (cb) -> fetchUntilEnd 'partners', cb
      (cb) -> db.curations.findOne { slug: 'featured-galleries' }, cb
    ], (err, [partners, featuredGalleries]) ->
      return callback err if err
      galleries = _.where partners, type: 'Gallery'
      console.log partners, galleries
      async.map featuredGalleries.slugs, (slug, cb) ->
        request
          .get("#{ARTSY_URL}/api/profiles/#{slug}")
          .set('X-Xapp-Token': xappToken)
          .end (err, res) -> cb err, res.body
      , (err, profiles) ->
        return callback err if err
        json =
          slug: 'galleries-index'
          a_to_z: aToZ galleries
          featured_profiles: for profile in profiles
            gallery = _.select(galleries, (gallery) ->
              slug = _.last gallery._links.profile.href.split('/')
              slug is profile.handle
            )[0]
            {
              slug: profile.handle
              image_url: profile._links.thumbnail.href
              href: profile._links.permalink.href
              name: gallery?.name
            }
        db.views.update(
          { slug: 'galleries-index' }, json, { upsert: true }, callback
        )

@storeView console.log if module is require.main