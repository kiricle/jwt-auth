const bcrypt = require('bcrypt');
const pool = require('../db');
const UserDto = require('../dtos/userDto');
const tokenService = require('./tokenService');
const ApiError = require('../exceptions/apiError');

class UserService {
    async singUp(email, password) {
        const doesUserExist = await pool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        );

        if (doesUserExist.rows.length) {
            throw ApiError.BadRequest('User with this email already exists', [
                'User with this email already exists',
            ]);
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        const newUser = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
            [email, hashedPassword]
        );

        const userDto = new UserDto(newUser.rows[0]);
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        };
    }

    async signIn(email, password) {
        const user = await pool.query('SELECT * FROM users WHERE email=$1', [
            email,
        ]);

        if (!user.rows.length) {
            throw ApiError.BadRequest('User with this email does not exist');
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!isPasswordCorrect) {
            throw ApiError.BadRequest('Incorrect password');
        }

        const userDto = new UserDto(user.rows[0]);
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto,
        };
    }

    async signOut(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);

        return token;
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError('User is not authorized');
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError('User is not authorized');
        }
        const user = await pool.query('SELECT * FROM users WHERE id=$1', [
            userData.id,
        ]);
        const userDto = new UserDto(user.rows[0]);
        const tokens = tokenService.generateToken({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        
        return {
            ...tokens,
            user: userDto,
        };
    }

    async getCurrentUser(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError('User is not authorized');
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError('User is not authorized');
        }

        const user = await pool.query('SELECT * FROM users WHERE id=$1', [
            userData.id,
        ]);

        return user.rows;
    }
}

module.exports = new UserService();
