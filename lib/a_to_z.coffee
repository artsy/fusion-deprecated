#
# Converts collection of API v2 resource data into an array of
# [ { key: 'A', items: [{ label: '', href: '' }]} }, { key: 'B', ... } ]
#
# galleries = [{ name: 'Gagosian', _links: { permalink: '' } }]
# hash = aToZ galleries
#

_ = require 'underscore'

module.exports = (resource) ->
  list = []
  for item in resource
    label = item.name
    char = label.toLowerCase()[0]
    key = if Number(char) then '0-9' else char.toUpperCase()
    row = _.findWhere list, key: key
    list.push row = { key: key, items: [] } unless row?
    row.items.push { label: label, href: item._links.permalink.href }
  _.sortBy list, (item) -> item.key