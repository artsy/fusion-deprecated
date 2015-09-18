import mongojs from 'mongojs'

let { MONGOHQ_URL } = process.env
let collections = ['artworks']
let db = mongojs(MONGOHQ_URL, collections)
db.collections =  collections

export default db
