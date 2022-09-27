const HttpError = require('./http_error')
const { UNAUTHORIZED } = require('./err_codes')

module.exports = class UnauthorizedError extends HttpError {
  constructor (msg, props) {
    super(UNAUTHORIZED, msg, props)
  }
}
