const { getUsers,updateUser, deleteUser, removeCommunity} = require('../controllers/user');
const express = require('express');

const router = express.Router();

router.route('/').get(getUsers).patch(updateUser).delete(deleteUser).put(removeCommunity)

module.exports = router;
