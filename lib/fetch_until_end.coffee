#
# When hitting a collection endpoint on API v2 this will "next" through the
# pages until no more results are returned. It will then store the results in a
# collection based on the resource name.
#
# fetchUntilEnd 'partners', (err) ->
#   db.apiv2_partners.count (err, total) ->
#

request = require 'superagent'
debug = require('debug') 'gravity'
db = require 'db'
artsyXapp = require 'artsy_xapp'
{ ARTSY_URL } = process.env

module.exports = (resource, callback) ->
  artsyXapp (err, xappToken) ->
    return callback err if err

    collection = db['apiv2_' + resource]

    recursivelyFetch = (url) ->
      request
        .get(url).set('X-Xapp-Token': xappToken)
        .query(size: 100)
        .end (err, res) ->
          return callback err if err
          return callback() if res.body._embedded.partners.length is 0
          collection.insert res.body._embedded.partners, (err) ->
            return callback err if err
            recursivelyFetch res.body._links.next.href

    collection.remove {}, (err) ->
      return callback err if err
      recursivelyFetch "#{ARTSY_URL}/api/#{resource}"
