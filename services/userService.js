const pool = require('../db/pool');
const error = require('../utils/errorHandle');
const encrypt = require('../utils/encrypt')

exports.signUp = async (req, res, next) => {
    try {
        let body = req.body;
        let sqlCheckDupUser = `SELECT * FROM public.users WHERE username=$1`;
        let responseCheckDupUser = await pool.query(sqlCheckDupUser, [body.username]);
        if (responseCheckDupUser.rowCount > 0) {
            return error.mapError(400, "User is dupplicate.", next);
        }

        let password = await encrypt.hashPassword(body.password, next)
        let sql = `INSERT INTO public.users
                    (firstname, lastname, email, username, user_password, roles)
                    VALUES($1, $2, $3, $4, $5, $6);`;
        let response = await pool.query(sql, [body.firstName, body.lastName, body.email,
        body.username, password, body.roles]);
        if (response.rowCount > 0) {
            return res.status(200).json({
                status: 'success',
                data: 'Insert data success'
            });
        } else {
            return error.mapError(400, "Insert data fail.", next);
        }
    } catch (err) {
        return error.mapError(500, "Internal server error.", next);
    }
}
exports.signIn = async (req, res, next) => {
    try {
        let body = req.body;
        let sql = `SELECT * FROM public.users WHERE username=$1`;
        let response = await pool.query(sql, [body.username])
        if (response.rowCount > 0) {
            const isPwdValid = await encrypt.comparePassword(body.password, response.rows[0].user_password)
            if (isPwdValid) {
                const token = await encrypt.generateJWT({
                    username: body.username,
                    roles: response.rows[0].roles,
                    userId: response.rows[0].id
                });
                return res.status(200).cookie('jwt', token, {
                    expires: new Date(Date.now() + encrypt.expiresToken),
                    httpOnly: true,
                    secure: false
                }).json({
                    status: 'success',
                    data: 'Login success',
                });
            } else {
                return error.mapError(401, "Password invalid", next);
            }

        } else {
            return error.mapError(404, "User not found", next);
        }
    } catch (err) {
        return error.mapError(500, "Internal server error.", next);
    }
}
exports.verifyToken = async (req, res, next) => {
    //1 check token
    if (req.headers.authorization == null) {
        return error.mapError(401, "Token undefined", next);
    }

    //const token = req.headers.authorization.split(" ")[1];
    const token = req.headers.authorization;

    if (!token) {
        return error.mapError(401, "Token undefined", next);
    }

    //2 verify token
    try {
        const data = await encrypt.verifyToken(token);
        req.user = {}
        req.user.roles = data.roles;
        req.user.userId = data.userId;
    } catch (err) {
        return error.mapError(401, 'Token invalid', next);
    }
    next();
}
exports.testAdminPermission = (req, res, next) => {
    return res.status(200).json('admin page');
}
exports.testUserPermission = (req, res, next) => {
    return res.status(200).json('user page');
}
exports.verifyPermissionWrite = (req, res, next) => {
    const user = req.user;
    if (user.roles != 'admin') {
        error.mapError(401, 'Permission invalid: Only admin can enter', next);
    }
    next();
}