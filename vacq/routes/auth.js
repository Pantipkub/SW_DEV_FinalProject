const express = require("express");
const {register, login, getMe, logout} = require('../controllers/auth');

const router = express.Router();

const {protect} = require('../middleware/auth');

//If there is a POST method that end with /... (e.g. /login), it will send to ... function (e.g. login)
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;
