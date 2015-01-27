#
# When hitting a collection endpoint on API v2 this will "next" through the
# pages until no more results are returned. It will then store the results in a
# collection based on the resource name.
#
# fetchUntilEnd 'partners', (err, partners) ->
#

request = require 'superagent'
debug = require('debug') 'gravity'
artsyXapp = require 'artsy_xapp'
{ ARTSY_URL } = process.env

module.exports = (resource, callback) ->
  artsyXapp (err, xappToken) ->
    return callback err if err

    data = []

    recursivelyFetch = (url) ->
      request
        .get(url).set('X-Xapp-Token': xappToken)
        .query(size: 100)
        .end (err, res) ->
          return callback err if err
          items = res.body._embedded[resource]
          return callback data if items.length is 0
          data = data.concat items
          recursivelyFetch res.body._links.next.href

    recursivelyFetch "#{ARTSY_URL}/api/#{resource}"
