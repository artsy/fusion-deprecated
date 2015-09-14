import db from 'lib/db'
import moment from 'moment'
import async from 'async'
import d from 'debug'
import request from 'superagent'
import artsyXapp from 'artsy-xapp'
import qs from 'querystring'

let debug = d('fetch')
let FETCH_OFFSET = Number(process.argv[2]) || 0
let { PAGE_SIZE, ARTSY_URL, REQUEST_THROTTLE, FETCH_UNIT,
  PARALLEL_LIMIT } = process.env
PAGE_SIZE = Number(PAGE_SIZE)
REQUEST_THROTTLE = Number(REQUEST_THROTTLE)
PARALLEL_LIMIT = Number(PARALLEL_LIMIT)

let save = (resource, data, callback) => {
  let bulk = db[resource].initializeOrderedBulkOp()
  data.forEach((work) => bulk.find({ _id: work._id }).upsert().updateOne(work))
  bulk.execute(callback)
}

let fetchAndSaveTimeFrame = ({ resource, numAgo, lastTotal, onEnd }) => {
  let fromTime = moment().subtract(numAgo, FETCH_UNIT).unix()
  let url = `${ARTSY_URL}/api/v1/${resource}`
  let headers = { 'x-xapp-token': artsyXapp.token }
  let fetch = (i, callback) => {
    let query = {
      page: i + 1,
      size: PAGE_SIZE,
      created_at_since: fromTime,
      sort: 'created_at'
    }
    debug(`fetching ${url}?${qs.stringify(query)}`)
    request.get(url).set(headers).query(query).end((err, res) => {
      debug(`fetched! ${url}?${qs.stringify(query)}`)
      if (err) return setTimeout(fetch, REQUEST_THROTTLE)
      save(resource, res.body, () => setTimeout(callback, REQUEST_THROTTLE))
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
    let times = Math.ceil(limit / PAGE_SIZE)
    async.timesLimit(times, PARALLEL_LIMIT, fetch, () => onEnd(total))
  })
}

let scrapeResource = (resource, callback) => {
  let lastTotal
  let timeUnitsFromToday = moment().diff(moment([2010,0,1]), FETCH_UNIT)
  request
    .get(`${ARTSY_URL}/api/v1/${resource}`)
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
          resource: resource,
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

artsyXapp.on('error', process.exit).init(() => {
  scrapeResource('artworks', () => debug('all done!'))
})
