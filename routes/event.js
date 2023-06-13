const express = require('express')
const {getEvent, createEvent, updateEvent,deleteEvent,eventCommunity} = require('../controllers/event')
const router = express.Router()


router.route('/').get(getEvent).post(createEvent)
router.route('/:id').patch(updateEvent).delete(deleteEvent).get(eventCommunity)


module.exports = router