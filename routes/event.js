const express = require('express')
const {getEvent, createEvent, updateEvent,deleteEvent,eventCommunity,getSingleEvent} = require('../controllers/event')
const router = express.Router()


router.route('/').get(getEvent).post(createEvent)
router.route('/:id').patch(updateEvent).delete(deleteEvent).get(eventCommunity)
router.route('/single/:id').get(getSingleEvent)


module.exports = router