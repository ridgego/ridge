const HttpError = require('./http_error')
const { PERMISSION_DENIED } = require('./err_codes')

module.exports = class ForBiddenError extends HttpError {
  constructor (msg, props) {
    super(PERMISSION_DENIED, msg, props)
  }
}
