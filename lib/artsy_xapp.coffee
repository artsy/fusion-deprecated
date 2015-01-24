request = require 'superagent'
{ ARTSY_URL, ARTSY_SECRET, ARTSY_ID } = process.env

token = null

module.exports = (callback) ->
  return callback null, token if token
  request
    .post("#{ARTSY_URL}/api/tokens/xapp_token")
    .send(client_id: ARTSY_ID, client_secret: ARTSY_SECRET)
    .end (err, res) ->
      callback err, token = res.body.token