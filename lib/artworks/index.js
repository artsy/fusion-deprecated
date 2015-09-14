import express from 'express'
import routes from './routes'

let app = express()

app.get('/api/v1/artworks', routes.index)

export default app
