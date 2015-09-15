//
// Library of business, retreival, and persistance logic around artwork data.
//

import _ from 'underscore'
import db from 'db'
import j from 'joi'
import async from 'async'
import d from 'debug'
import { ObjectId } from 'mongojs'
import request from 'superagent'
import artsyXapp from 'artsy-xapp'
let debug = d('db')

let { MAX_PAGE_SIZE, PAGE_SIZE, ARTSY_URL } = process.env
MAX_PAGE_SIZE = Number(MAX_PAGE_SIZE)
PAGE_SIZE = Number(PAGE_SIZE)

// Schemas
let querySchema = {
  offset: j.number(),
  limit: j.number().max(MAX_PAGE_SIZE).default(PAGE_SIZE),
  fields: j.array().items(j.string())
}

// Indexes
db.artworks.ensureIndex({ id: 1 }, { unique: true, sparse: true }, (err) => {
  debug("finished writing id index", arguments)
})

// Library of model functions
let Artwork = {}

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
    let cursor = db.artworks.find(query, projection).skip(input.offset)
    debug(`querying artworks for ${JSON.stringify(query)} ` +
      `filtering ${JSON.stringify(projection)}...`)
    async.parallel([
      ((cb) => cursor.limit(input.limit).toArray(cb)),
      ((cb) => cursor.count(cb))
    ], (err, [ artworks, count ]) => {
      callback(err, artworks, count)
    })
  })
}

// Fetches an artwork by id or slug, then refreshes the data in the background.
//
// @param {String} id id string or slug
// @param {Function} callback Calls back with (err, artwork)

Artwork.findAndUpdate = (id, callback) => {
  let query = ObjectId.isValid(id) ? { _id: ObjectId(id) } : { id: id }
  db.artworks.findOne(query, (err, artwork) => {
    if (err) return callback(err)
    if (artwork) {
      callback(null, artwork)
      throttledFetchAndUpdate(id)
    } else {
      fetchAndUpdate(id, callback)
    }
  })
}

let fetchAndUpdate = (id, callback) => {
  request
    .get(`${ARTSY_URL}/api/v1/artwork/${id}`)
    .set({ 'x-xapp-token': artsyXapp.token })
    .end((err, res) => {
      if (err && callback) return callback(err)
      if (!res.body && callback) return callback()
      if (callback) callback(null, res.body)
      db.artworks.save(res.body, (err) => {
        debug(`refreshed artwork data for ${id}`)
      })
    })
}

let throttledFetchAndUpdate = _.throttle(fetchAndUpdate, 5000)

// Given json from the Gravity API it typecast fields into something more
// appropriate to be stored to Mongo.
//
// @param {Object} json
// @return The Mongo-ready document

Artwork.toDoc = (json) => {
  return _.extend(json, {
    _id: ObjectId(json._id),
    published_at: new Date(json.published_at)
  })
}

export default Artwork
