const Community = require('../models/community');
const User = require('../models/user');
const Event = require('../models/event');
const { BadRequestError, NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const SaveNotification = require('../middleware/SaveNotification');
const ObjectId = require('mongoose').Types.ObjectId;

const CreateCommunity = async (req, res) => {
  const num = Math.floor(Math.random() * 90000) + 10000;
  req.body.createdBy = req.user.userId;
  req.body.referenceCode = `COM-${num}`;

  const finduser = await User.findOne({ _id: req.user.userId });

  if (!finduser) {
    throw new BadRequestError(`No user exist`);
  }
  // if (finduser && finduser.community) {
  //   throw new BadRequestError(`User already belongs to a community`);
  // }
  const findName = await Community.findOne({ name: req.body.name });

  if (findName && findName.name) {
    throw new BadRequestError(`Community with ${req.body.name} already exist`);
  }

  if (!num) {
    throw new BadRequestError('Something went wrong, please try again');
  }

  const com = await Community.create({ ...req.body });

  const use = await User.findByIdAndUpdate(
    { _id: req.user.userId },
    { $push: { community: com._id } },
    { new: true }
  );
  SaveNotification({ user: use, comId:com._id  });
  res.status(StatusCodes.CREATED).json({ com });
};

const GetCommunity = async (req, res) => {
  const { reference, name } = req.query;

  // };

  // if (reference) {
  //   queryObject.referenceCode = reference;
  // }

  // if (name) {
  //   queryObject.name = name;
  // }

  // let result = Community.find(queryObject);
  // console.log(result)

  // if (!result) {
  //   console.log('here')
  // result = Community.find({ createdBy: req.user.userId });
  const finduser = await User.findOne({ _id: req.user.userId });

  result = Community.find({
    _id: {
      $in: finduser.community,
    },
  });

  const comm = await result;

  if (!comm.length > 0) {
    throw new NotFoundError(`Community not found`);
  }
  res.status(StatusCodes.OK).json({ data: comm, count: comm.length });
};

const deleteCommunity = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const community = await Community.findOne({ _id: id });

  if (!community || community === null) {
    throw new NotFoundError('No commuity found');
  }

  if (community.createdBy.toString() !== userId.toString()) {
    throw new BadRequestError('User can only delete community they create');
  }

  const users = await User.find({ community: community._id });

  if (users.length > 0) {
    if (users.length === 1) {
      if (users[0].community.toString() !== id.toString()) {
        throw new BadRequestError('User can only delete community they create');
      }
    } else {
      throw new BadRequestError('Community still has users attached');
    }
  } else if (
    users.length <= 1 &&
    users[0] &&
    users[0].community.toString() !== id.toString()
  ) {
    throw new BadRequestError('User can only delete community they create');
  } else if (users.length === 0) {
    throw new NotFoundError('User not found with community id');
  }

  const event = await Event.find({ community: new ObjectId(id) });

  if (event.length > 0) {
    throw new BadRequestError('Community still has event');
  }
  await User.updateOne(
    { _id: req.user.userId },
    { $unset: { community: ' ' } },
    { new: true }
  );

  await Community.findOneAndDelete({ _id: id });

  res.status(StatusCodes.OK).json({ message: 'Community deleted' });
};

module.exports = {
  CreateCommunity,
  GetCommunity,
  deleteCommunity,
};
