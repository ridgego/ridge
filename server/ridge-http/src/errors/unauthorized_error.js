const HttpError = require('./http_error'),
    { UNAUTHORIZED } = require('./err_codes');

module.exports = class UnauthorizedError extends HttpError {
    constructor(msg, props) {
        super(UNAUTHORIZED, msg, props);
    }
};
