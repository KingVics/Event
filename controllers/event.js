const Event = require('../models/event');
const Community = require('../models/community');
const User = require('../models/user');
const NotificationTokenSchema = require('../models/notification');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;
const scheduleEvent = require('../middleware/scheduleEvent');
const RescheduleEvent = require('../middleware/rescheduleEvent');
const CancelEvebnt = require('../middleware/cancelSchedule');

const getEvent = async (req, res) => {
  const { name } = req.query;

  let result;

  if (name) {
    result = Event.find({
      name: { $regex: name, $options: 'i' },
      createdBy: new ObjectId(req.user.userId),
    });
  } else {
    result = Event.find({ createdBy: new ObjectId(req.user.userId) });
  }

  const event = await result;

  if (!event || event.length <= 0) {
    throw new NotFoundError('No event found');
  }

  res.status(StatusCodes.OK).json({ message: 'Event found', data: event });
};

const createEvent = async (req, res) => {
  const { community } = req.body;

  const findCommunity = await Community.findOne({ referenceCode: community });
  const token = await NotificationTokenSchema.find({
    community: {
      $in: findCommunity._id,
    },
  });

  if (!token) {
    throw new BadRequestError('Device not registered');
  }

  if (!findCommunity || findCommunity === null) {
    throw new NotFoundError(
      'Event cannot be created because no community found'
    );
  }

  const filteredToken = token?.map((c) => ({
    token: c.token,
  }));

  if (!filteredToken) {
    throw new BadRequestError('Device not registered');
  }

  const data = {
    name: req.body.name,
    eventDate: req.body.eventDate,
    reminderDate: req.body.reminderDate,
    createdBy: req.user.userId,
    community: findCommunity._id,
  };

  const presentDate = new Date().setHours(0, 0, 0, 0);

  // if (
  //   new Date(data.eventDate).setHours(0, 0, 0, 0) < presentDate ||
  //   new Date(data.reminderDate).setHours(0, 0, 0, 0) < presentDate ||
  //   new Date(data.reminderDate).getTime() >
  //     new Date(data.eventDate).setHours(0, 0, 0, 0)
  // ) {
  //   throw new BadRequestError(
  //     'Event date or reminder date can not be past date'
  //   );
  // }

  const event = await Event.create({ ...data });

  if (!event) {
    throw new BadRequestError('Cannot process request');
  }

  const tData = {
    sound: 'default',
    title: data.name,
    body: `You have an event ${data.name} coming up on ${data.eventDate}`,
    data: { 'Event Date': data.eventDate, 'Reminder Date': data.reminderDate },
  };

  scheduleEvent({
    filteredToken,
    tData,
    eventId: event._id,
    userId: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({ message: 'Event created', data: [] });
};

const updateEvent = async (req, res) => {
  const {
    params: { id },
    body: { reminderDate },
  } = req;

  const token = await NotificationTokenSchema.find({
    userId: req.user.userId,
  });

  if (!token) {
    throw new BadRequestError('Device not registered');
  }

  const oneEvent = await Event.findById({ _id: id });

  if (oneEvent?.expired) {
    throw new BadRequestError('This event has expired');
  }
  const event = await Event.findOneAndUpdate(
    { _id: id },
    { reminderDate },
    { new: true }
  );

  if (!event || event === null) {
    throw new NotFoundError('Event not found');
  }

  const presentDate = new Date().setHours(0, 0, 0, 0);

  // if (
  //   new Date(eventDate).setHours(0, 0, 0, 0) < presentDate ||
  //   new Date(reminderDate).setHours(0, 0, 0, 0) < presentDate ||
  //   new Date(reminderDate).getTime() > new Date(eventDate).setHours(0, 0, 0, 0)
  // ) {
  //   throw new BadRequestError(
  //     'Event date or reminder date can not be past date'
  //   );
  // }

  // if (
  //   event.createdBy &&
  //   event.createdBy.toString() !== req.user.userId.toString()
  // ) {
  //   throw new BadRequestError('User can only edit created event');
  // }

  const tData = {
    sound: 'default',
    title: event.name,
    body: `You have an event ${event.name} coming up on ${event.eventDate}`,
    data: {
      'Event Date': event.eventDate,
      'Reminder Date': event.reminderDate,
    },
  };

  RescheduleEvent({
    token,
    tData,
    eventId: event._id,
    userId: req.user.userId,
  });

  res.status(StatusCodes.OK).json({ message: 'Successful', data: [] });
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  const event = await Event.findOne({ _id: id });

  if (!event || event === null) {
    throw new NotFoundError('Event not found');
  }

  if (event.createdBy.toString() !== req.user.userId) {
    throw new BadRequestError('User can only delete created event');
  }

  CancelEvebnt({ eventId: event._id, userId: req.user.userId });

  await Event.findOneAndDelete({ _id: id });

  res.status(StatusCodes.OK).json({ message: 'Successful' });
};

const eventCommunity = async (req, res) => {
  const { id } = req.params;

  const event = await Event.find({ community: new ObjectId(id) });
  res.status(StatusCodes.OK).json({ message: 'Successful', data: event });
};

const getSingleEvent = async (req, res) => {
  const { id } = req.params;

  const event = await Event.find({ _id: id });
  res.status(StatusCodes.OK).json({ message: 'Successful', data: event });
};

module.exports = {
  getEvent,
  updateEvent,
  deleteEvent,
  createEvent,
  eventCommunity,
  getSingleEvent,
};
