const jwt = require('jsonwebtoken');
const pool = require('../db');

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: '30d',
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '30d',
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await pool.query(
            'SELECT * FROM refresh_tokens WHERE user_id = $1',
            [userId]
        );  
        const expiresAt = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;

        if (tokenData.rows.length) {
            const updatedToken = await pool.query(
                'UPDATE refresh_tokens SET token = $1, expires_at=to_timestamp($3/1000.0) WHERE user_id = $2 RETURNING *',
                [refreshToken, userId, expiresAt]
            );
            return updatedToken.rows[0];
        }

        const newToken = await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, to_timestamp($3/1000.0)) RETURNING *',
            [userId, refreshToken, expiresAt]
        );

        return newToken.rows[0];
    }

    async removeToken(refreshToken) {
        const token = await pool.query(
            'DELETE FROM refresh_tokens WHERE token = $1 RETURNING *',
            [refreshToken]
        );

        return token.rows[0];
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const token = await pool.query(
            'SELECT * FROM refresh_tokens WHERE token = $1',
            [refreshToken]
        );

        return token.rows[0];
    }
}

module.exports = new TokenService();
