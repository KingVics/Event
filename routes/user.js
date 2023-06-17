const { getUsers,updateUser, deleteUser, removeCommunity,LogoutUser} = require('../controllers/user');
const express = require('express');

const router = express.Router();

router.route('/').get(getUsers).patch(updateUser).delete(deleteUser).put(removeCommunity)
router.route('/logout').post(LogoutUser)

module.exports = router;
