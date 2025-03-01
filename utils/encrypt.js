const bcrypt = require('bcrypt');
const error = require('./errorHandle');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })
var jwt = require('jsonwebtoken');

exports.hashPassword = async (plaintextPassword, next) => {
    if (!plaintextPassword) return null;
    try {
        const hash = await bcrypt.hash(plaintextPassword, 10);
        return hash;
    } catch (err) {
        error.mapError(500, 'Internal server error.', next);
    }
}

exports.comparePassword = async (plaintextPassword, hash) => {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

exports.expiresToken = 60 * 60 * 24;

exports.generateJWT = async (data) => {
    const token = await jwt.sign(data, process.env.JWT_SECRET, { expiresIn: exports.expiresToken });
    return token;
}

exports.verifyToken = async (token) => {
    const result = await jwt.verify(token, process.env.JWT_SECRET);
    return result;
}