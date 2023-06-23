const ApiError = require('../exceptions/apiError');

module.exports = function (err, req, res, next) {
    if (err instanceof ApiError) {
        return res
            .status(err.status)
            .json(err);
    }
    res.status(500).json({ message: 'Unexpected error' });
};
