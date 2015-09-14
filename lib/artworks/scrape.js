//
// Iterates through Gravity's artworks partitioning by periods of time
// (e.g. artworks created between x days), and saves the json to the database.
//

import db from 'db'
import moment from 'moment'
import async from 'async'
import d from 'debug'
import request from 'superagent'
import artsyXapp from 'artsy-xapp'
import qs from 'querystring'
import Artwork from './model'
import { ObjectId } from 'mongojs'
let debug = d('fetch')

let { GRAVITY_PAGE_SIZE, ARTSY_URL, REQUEST_THROTTLE, FETCH_UNIT,
  PARALLEL_LIMIT } = process.env
GRAVITY_PAGE_SIZE = Number(GRAVITY_PAGE_SIZE)
REQUEST_THROTTLE = Number(REQUEST_THROTTLE)
PARALLEL_LIMIT = Number(PARALLEL_LIMIT)
// Pass in the number of time units ago you want to begin scraping
// e.g. npm run scrape 10 will start scraping 10 days ago
let FETCH_OFFSET = Number(process.argv[2]) || 0

// Bulk saves an array of artwork data.
//
// @param {Array} artworks
// @param {Function} callback

let save = (artworks, callback) => {
  let bulk = db.artworks.initializeOrderedBulkOp()
  artworks.forEach((artwork) => {
    bulk.find({ _id: ObjectId(artwork._id) }).upsert()
      .updateOne(Artwork.toDoc(artwork))
  })
  bulk.execute(callback)
}

// Fetches artworks between a time frame saving the records to the db.
//
// @param {Object} options
// - numAgo {Number} Number of time unite (e.g days) to start from
// - lastTotal {lastTotal} The last x-total-count to know when to stop
// - onEnd {Function} callback

let fetchAndSaveTimeFrame = ({ numAgo, lastTotal, onEnd }) => {
  let fromTime = moment().subtract(numAgo, FETCH_UNIT).unix()
  let url = `${ARTSY_URL}/api/v1/artworks`
  let headers = { 'x-xapp-token': artsyXapp.token }
  let fetch = (i, callback) => {
    let query = {
      page: i + 1,
      size: GRAVITY_PAGE_SIZE,
      created_at_since: fromTime,
      sort: 'created_at'
    }
    debug(`fetching ${url}?${qs.stringify(query)}`)
    request.get(url).set(headers).query(query).end((err, res) => {
      debug(`fetched! ${url}?${qs.stringify(query)}`)
      if (err) return setTimeout(fetch, REQUEST_THROTTLE)
      save(res.body, () => setTimeout(callback, REQUEST_THROTTLE))
    })
  }
  debug(`fetching items from ${numAgo} ${FETCH_UNIT} ago...`)
  request.get(url).set(headers).query({
    total_count: 1,
    created_at_since: fromTime
  }).end((err, res) => {
    if (err) return onEnd()
    let total = res.headers['x-total-count']
    let limit = lastTotal ? total - lastTotal : total
    debug(`fetched: ${lastTotal} total items, now fetching ${limit} items...`)
    if (limit <= 0) return onEnd(total)
    let times = Math.ceil(limit / GRAVITY_PAGE_SIZE)
    async.timesLimit(times, PARALLEL_LIMIT, fetch, () => onEnd(total))
  })
}

// Runs the actual scraper. Makes an initial HEAD request to determine where
// to start if a FETCH_OFFSET is specified., then iterates through the
// endpoint, saving the last total to determine when to stop for that page
// n/c there's no `created_at_before` support in the API currently.
//
// @param {Function} callback

let scrape = (callback) => {
  let lastTotal
  let timeUnitsFromToday = moment().diff(moment([2010,0,1]), FETCH_UNIT)
  request
    .get(`${ARTSY_URL}/api/v1/artworks`)
    .set({ 'x-xapp-token': artsyXapp.token })
    .query({
      total_count: 1,
      created_at_since: moment().subtract(FETCH_OFFSET, FETCH_UNIT).unix()
    })
    .end((err, res) => {
      if (err) return callback(err)
      lastTotal = res.headers['x-total-count']
      async.timesSeries(timeUnitsFromToday, (i, callback) => {
        fetchAndSaveTimeFrame({
          numAgo: i + FETCH_OFFSET,
          lastTotal: lastTotal,
          onEnd: (total) => {
            lastTotal = total || lastTotal
            setTimeout(callback, REQUEST_THROTTLE)
          }
        }, callback)
      }, callback)
    })
}

// Fetch an xapp token and begin the scraper
artsyXapp.on('error', process.exit).init(() => scrape(() => debug('all done!')))
