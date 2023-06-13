const express = require('express');
const { LoginUser, RegisterUser } = require('../controllers/auth');

const router = express.Router();

router.post('/register', RegisterUser);
router.post('/login', LoginUser);


module.exports = router