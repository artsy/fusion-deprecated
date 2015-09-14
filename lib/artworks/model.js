//
// Library of business, retreival, and persistance logic around artwork data.
//

import _ from 'underscore'
import db from 'db'
import j from 'joi'
import async from 'async'
import d from 'debug'
import { ObjectId } from 'mongojs'
let debug = d('db')

let { MAX_PAGE_SIZE, PAGE_SIZE } = process.env
MAX_PAGE_SIZE = Number(MAX_PAGE_SIZE)
PAGE_SIZE = Number(PAGE_SIZE)

let Artwork = {}
let querySchema = {
  offset: j.number(),
  limit: j.number().max(MAX_PAGE_SIZE).default(PAGE_SIZE),
  fields: j.array().items(j.string())
}

// Converts a hash of query params into a find query that also returns
// the count of that query.
//
// @param {Object} input Query params hash
// @param {Function} callback Calls back with (err, artworks, count)

Artwork.where = (input, callback) => {
  j.validate(input, querySchema, (err, input) => {
    if (err) return callback(err)
    let query = _.omit(input, 'limit', 'offset', 'fields', '')
    let projection
    if (input.fields) {
      projection = {}
      input.fields.forEach((field) => projection[field] = 1)
    }
    debug(`querying artworks for ${JSON.stringify(query)} ` +
      `filtering ${JSON.stringify(projection)}...`)
    async.parallel([
      ((cb) =>
        db.artworks.find(query, projection).limit(input.limit)
          .skip(input.offset).toArray(cb)
      ),
      ((cb) => db.artworks.count(query, cb))
    ], (err, [ artworks, count ]) => {
      callback(err, artworks, count)
    })
  })
}

// Given json from the Gravity API it typecast fields into something more
// appropriate to be stored to Mongo.
//
// @param {Object} json
// @param {Function} callback Calls back with (err, doc)

Artwork.toDoc = (json) => {
  return _.extend(json, {
    _id: ObjectId(json._id),
    published_at: new Date(json.published_at)
  })
}

export default Artwork
