import artsyXapp from 'artsy-xapp'
import httpProxy from 'http-proxy'
let proxy = httpProxy.createProxyServer()
let { ARTSY_URL } = process.env

let middleware = (req, res) => {
  req.headers['x-xapp-token'] = artsyXapp.token
  proxy.web(req, res, { target: ARTSY_URL, secure: false })
}

export default middleware
