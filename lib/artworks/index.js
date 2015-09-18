import express from 'express'
import routes from './routes'

let app = express()

app.get('/api/v1/artworks', routes.index)
app.get('/api/v1/artwork/:id', routes.show)

export default app
