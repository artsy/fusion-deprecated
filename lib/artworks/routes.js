import db from 'db'
import Artwork from './model'
let { PAGE_SIZE } = process.env
PAGE_SIZE = Number(PAGE_SIZE)
let routes = {}

routes.index = (req, res, next) => {
  Artwork.where(req.query, (err, artworks, count) => {
    if (err) return next(err)
    res.send({ results: artworks, count: count })
  })
}

export default routes
