const HttpError = require('./http_error')
const { SERVICE_UNAVAILABLE } = require('./err_codes')

module.exports = class ServiceUnavailableError extends HttpError {
  constructor (msg, props) {
    super(SERVICE_UNAVAILABLE, msg, props)
  }
}
