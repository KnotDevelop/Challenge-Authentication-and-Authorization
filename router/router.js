const express = require('express');
const userService = require('../services/userService')

const router = express.Router();

router.route('/admin')
    .get(userService.verifyToken, userService.verifyPermissionWrite, userService.testAdminPermission);

router.route('/user')
    .get(userService.verifyToken, userService.testUserPermission);

router.route('/signup')
    .post(userService.signUp);

router.route('/signin')
    .post(userService.signIn);

module.exports = router;