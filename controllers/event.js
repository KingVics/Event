const Event = require('../models/event');
const Community = require('../models/community');
const User = require('../models/user');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const ObjectId = require('mongoose').Types.ObjectId;

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
  if (!findCommunity || findCommunity === null) {
    throw new NotFoundError(
      'Event cannot be created because no community found'
    );
  }

  if (
    !req.user.userId ||
    req.user.userId.toString() !== findCommunity.createdBy.toString()
  ) {
    throw new BadRequestError('You do not belong to the community ');
  }

  const data = {
    name: req.body.name,
    eventDate: req.body.eventDate,
    reminderDate: req.body.reminderDate,
    createdBy: req.user.userId,
    community: findCommunity._id,
  };

  const presentDate = new Date().setHours(0, 0, 0, 0);

  if (
    new Date(data.eventDate).setHours(0, 0, 0, 0) < presentDate ||
    new Date(data.reminderDate).setHours(0, 0, 0, 0) < presentDate ||
    new Date(data.reminderDate).getTime() >
      new Date(data.eventDate).setHours(0, 0, 0, 0)
  ) {
    throw new BadRequestError(
      'Event date or reminder date can not be past date'
    );
  }

  const event = await Event.create({ ...data });

  res
    .status(StatusCodes.CREATED)
    .json({ message: 'Event created', data: event });
};

const updateEvent = async (req, res) => {
  const {
    params: { id },
    body: { name, eventDate, reminderDate },
  } = req;

  const event = await Event.findOneAndUpdate(
    { _id: id },
    { name, eventDate, reminderDate },
    { new: true }
  );

  if (!event || event === null) {
    throw new NotFoundError('Event not found');
  }

  if (
    event.createdBy &&
    event.createdBy.toString() !== req.user.userId.toString()
  ) {
    throw new BadRequestError('User can only edit created event');
  }
  res.status(StatusCodes.OK).json({ message: 'Successful', data: event });
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

  await Event.findOneAndDelete({ _id: id });

  res.status(StatusCodes.OK).json({ message: 'Successful' });
};

const eventCommunity = async (req, res) => {
  const { id } = req.params;

  const event = await Event.find({ community: new ObjectId(id) });
  res.status(StatusCodes.OK).json({ message: 'Successful', data: event });
};

module.exports = {
  getEvent,
  updateEvent,
  deleteEvent,
  createEvent,
  eventCommunity,
};
