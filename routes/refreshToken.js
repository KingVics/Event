const express = require('express');
const refreshToken = require('../controllers/refreshToken');

const router = express.Router();

router.get('/', refreshToken);

module.exports = router;