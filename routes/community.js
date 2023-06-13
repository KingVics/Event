const express = require('express');
const { CreateCommunity, GetCommunity,deleteCommunity } = require('../controllers/community');
const router = express.Router();

router.route('/').post(CreateCommunity).get(GetCommunity);
router.route('/:id').delete(deleteCommunity)

module.exports = router;
