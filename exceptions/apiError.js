module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError(errors = []) {
        throw new ApiError(401, 'User is not authorized', errors);
    }

    static BadRequest(message, errors = []) {
        throw new ApiError(400, message, errors);
    }
};
