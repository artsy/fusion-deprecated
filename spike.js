// request now - 1 month
// total_count=1000
// request pages 1..10
// stored = 1000
// request now - 2 months
// total_count=2100
// request pages 1..(2100 - stored / 100) = 11

{ PAGE_SIZE } = process.env
db = import 'lib/db'
moment = import 'moment'

let currentPage = 0
let fetchAndSaveNextPage = () => {
  let total
  request
    .get(`${GRAVITY_URL}/api/v1/artworks`)
    .query({
      page: 1,
      size: PAGE_SIZE,
      created_at_since: moment().subtract(1, 'month'),
      total_count: total ? undefined: 1
    })
    .end((err, res) => {
      currentPage++
      if (err) return callback(err)
      if (!total) total = res.headers['x-total-count']
      db.artworks.update({}, res.body, { upsert: true, multi: true }, (err) => {
        fetchAndSaveNextPage()
      })
    })
}
