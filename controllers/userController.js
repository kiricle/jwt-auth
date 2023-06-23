const userService = require('../services/userService');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/apiError');

class UserController {
    async signUp(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(
                    ApiError.BadRequest('Validation error', errors.array())
                );
            }
            const { email, password } = req.body;

            const userData = await userService.singUp(email, password);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return res.status(201).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async signIn(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.signIn(email, password);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return res.status(200).json(userData);
        } catch (error) {
            next(error);
        }
    }

    async signOut(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            await userService.signOut(refreshToken);
            res.clearCookie('refreshToken');
            return res.status(200).json({
                message: 'User successfully logged out',
            });
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async getCurrentUser(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.getCurrentUser(refreshToken);
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
