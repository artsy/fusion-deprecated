import mongojs from 'mongojs'

let { MONGOHQ_URL } = process.env
let db = mongojs(MONGOHQ_URL, ['artworks'])

export default db
