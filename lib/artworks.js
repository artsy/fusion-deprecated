import db from 'lib/db'
import moment from 'moment'
import async from 'async'
import d from 'debug'
import request from 'superagent'
import artsyXapp from 'artsy-xapp'

let debug = d('fetch')
let { PAGE_SIZE, ARTSY_URL, REQUEST_THROTTLE } = process.env
PAGE_SIZE = Number(PAGE_SIZE)
REQUEST_THROTTLE = Number(REQUEST_THROTTLE)

let save = (resource, data, callback) => {
  let bulk = db[resource].initializeOrderedBulkOp()
  data.forEach((work) => {
    bulk.find({ _id: work._id }).upsert().updateOne(work)
  })
  bulk.execute(callback)
}

let fetchAndSaveMonth = ({ resource, monthsAgo, lastTotal, onEnd }) => {
  let total
  let url = `${ARTSY_URL}/api/v1/${resource}`
  let headers = { 'x-xapp-token': artsyXapp.token }
  let fromTime = moment().subtract(monthsAgo, 'months').unix()
  let fetch = (page, callback) => {
    debug(`fetching page ${page}...`)
    request.get(url).set(headers).query({
      page: page + 1,
      size: PAGE_SIZE,
      created_at_since: fromTime
    }).end((err, res) => {
      debug(`fetched ${page} of ${total / PAGE_SIZE} total`)
      if (err) return setTimeout(fetch, REQUEST_THROTTLE)
      save(resource, res.body, () => setTimeout(callback, REQUEST_THROTTLE))
    })
  }
  request.get(url).set(headers).query({
    total_count: 1,
    created_at_since: fromTime
  }).end((err, res) => {
    if (err) return onEnd()
    total = res.headers['x-total-count']
    if (total == 0) return onEnd()
    let limit = lastTotal ? lastTotal - total : total
    async.timesSeries(Math.ceil(limit / PAGE_SIZE), fetch, onEnd)
  })
}

let scrapeResource = (resource) => {
  let lastTotal
  async.times(60, (i, callback) => {
    fetchAndSaveMonth({
      resource: resource,
      monthsAgo: i,
      lastTotal: lastTotal,
      onEnd: (total) => {
        lastTotal = total
        debug(`fetching next month...`)
        setTimeout(callback, REQUEST_THROTTLE)
      }
    }, () => debug('All done!'))
  })
}

artsyXapp.on('error', process.exit).init(()=> scrapeResource('artworks'))
