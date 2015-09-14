import db from 'db'

let { PAGE_SIZE } = process.env
PAGE_SIZE = Number(PAGE_SIZE)
let routes = {}

routes.index = (req, res, next) => {
  db.artworks.find(req.query).limit(PAGE_SIZE).toArray((err, artworks) => {
    if (err) return next(err)
    res.send(artworks)
  })
}

export default routes
