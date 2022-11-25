const HttpError = require('./http_error')
const { NOT_IMPLEMENTED } = require('./err_codes')

module.exports = class NotImplementedError extends HttpError {
  constructor (msg, props) {
    super(NOT_IMPLEMENTED, msg, props)
  }
}
