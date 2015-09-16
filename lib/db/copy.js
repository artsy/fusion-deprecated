//
// CLI that mongodumps + mongorestores from production to MONGOHQ_URL
// `npm run dbcopy`
//

import d from 'debug'
import utils from 'mongo-utils'
import url from 'url'
import path from 'path'
let p = url.parse
let debug = d('db')
let { MONGOHQ_URL, COPY_MONGO_URL } = process.env

utils.log = debug
let tmpDir = path.resolve(__dirname, '../../', 'tmp')

debug(`copying ${p(COPY_MONGO_URL).hostname} to ${p(MONGOHQ_URL).hostname}...`)
utils.dumpDatabase(COPY_MONGO_URL, tmpDir, (err, stdout, stderr) => {
  if (err || stderr) return debug(err || stderr)
  debug('finished dump, restoring...')
  utils.restoreDatabase(MONGOHQ_URL, tmpDir, (err, stdout, stderr) => {
    if (err || stderr) return debug(err || stderr)
    debug('finished!')
  }).stdout.on('data', debug)
}).stdout.on('data', debug)
