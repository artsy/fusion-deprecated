express = require 'express'
db = require 'db'

app = module.exports = express()

app.get '/api/v1/views/:slug', (req, res, next) ->
  db.views.findOne { slug: req.params.slug }, (err, data) ->
    return next err if err
    res.send data
