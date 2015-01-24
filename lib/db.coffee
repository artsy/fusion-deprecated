#
# Wraps & exports a mongojs instance. https://github.com/mafintosh/mongojs
#

mongojs = require 'mongojs'
{ MONGOHQ_URL } = process.env

module.exports = mongojs MONGOHQ_URL, ['apiv2_partners', 'views', 'curations']
