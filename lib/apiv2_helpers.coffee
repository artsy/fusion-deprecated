#
# Helpers to DRY up common API v2 logic
#

_ = require 'underscore'
async = require 'async'
request = require 'superagent'
{ ARTSY_URL } = process.env

# Map curries into an image urls hash
#
# @param {Object} data Model data returned from endpoint
# @return {Object} hash of { large: 'http://foo.jpg' }

@imageUrls = (data) ->
  imageUrls = {}
  versions = data?.image_versions
  return null unless versions?.length
  for version in versions
    if data._links.thumbnail
      # Work around an API bug where the CDN is wrong
      url = data._links.thumbnail.href.split('/')
      url.pop()
      imageTempl = url.join('/') + '/{rel}'
    else
      imageTempl = (curie.href for curie in data._links.curies when \
        curie.name is 'image')[0]
    imageUrls[version] = imageTempl.replace '{rel}', version + '.jpg'
  imageUrls
