const HttpError = require('./http_error')
const { BADREQUEST } = require('./err_codes')

module.exports = class BadRequestError extends HttpError {
  constructor (msg, props) {
    super(BADREQUEST, msg, props)
  }
}
