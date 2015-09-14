import d from 'debug'
let debug = d('app')

let errorHandler = (err, req, res, next) => {
  debug(err.stack)
  let status = err.status || err.name == 'ValidationError' ? 403 : 500
  res.status(status).send({
    status: status,
    message: err.message || err.stack || err.toString()
  })
}

export default errorHandler
