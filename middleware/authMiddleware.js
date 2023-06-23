const ApiError = require('../exceptions/apiError');
const tokenService = require('../services/tokenService');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader) {
            return next(ApiError.UnauthorizedError('Unauthorized'))
        }

        const accessToken = authorizationHeader.split(' ')[1];
        
        if(!accessToken) {
            return next(ApiError.UnauthorizedError('Unauthorized'))
        }

        const userData = tokenService.validateAccessToken(accessToken);

        if(!userData) {
            return next(ApiError.UnauthorizedError('Unauthorized'))
        }
        

        req.user = userData;

        next();

    } catch (error) {
        next(ApiError.UnauthorizedError('Unauthorized')) 
    }

}