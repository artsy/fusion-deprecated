express = require 'express'
db = require 'db'

app = module.exports = express()

app.get '/api/orchestration/galleries-index', (req, res, next) ->
  db.views.findOne { key: 'galleries_index' }, (err, data) ->
    return next err if err
    res.send data
