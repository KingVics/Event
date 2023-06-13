const Community = require('../models/community');
const User = require('../models/user');
const { BadRequestError, NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const user = require('../models/user');
const ObjectId = require('mongoose').Types.ObjectId;

const CreateCommunity = async (req, res) => {
  const num = Math.floor(Math.random() * 90000) + 10000;
  req.body.createdBy = req.user.userId;
  req.body.referenceCode = `COM-${num}`;

  const findName = await Community.findOne({ name: req.body.name });

  if (findName && findName.name) {
    throw new BadRequestError(`Community with ${req.body.name} already exist`);
  }

  if (!num) {
    throw new BadRequestError('Something went wrong, please try again');
  }
  const com = await Community.create({ ...req.body });

  res.status(StatusCodes.CREATED).json({ com });
};

const GetCommunity = async (req, res) => {
  const { reference, name } = req.query;

  let queryObject = {};

  if (reference) {
    queryObject.referenceCode = reference;
  }

  if (name) {
    queryObject.name = name;
  }

  let result = Community.find(queryObject);

  if (!result) {
    result = Community.find({});
  }

  const comm = await result;

  if (!comm.length > 0) {
    throw new NotFoundError(
      `Community with ${
        queryObject.referenceCode
          ? queryObject.referenceCode
          : queryObject.name
          ? queryObject.name
          : ''
      } not found`
    );
  }
  res.status(StatusCodes.OK).json({ comm, count: comm.length });
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

  const users = await User.find({ community: new ObjectId(id) });

  if (users.length > 1) {
    throw new BadRequestError('Community still has users attached');
  } else if (
    (users.length <= 1 &&
      user[0] &&
      users[0].community.toString() !== id.toString()) ||
    users.length === 0
  ) {
    throw new BadRequestError('User can only delete community they create');
  }

  await User.updateOne(
    { _id: req.user.userId },
    { $unset: { community: ' ' } }
  );

  await Community.findOneAndDelete({ _id: id });

  res.status(StatusCodes.OK).json('Done');
};

module.exports = {
  CreateCommunity,
  GetCommunity,
  deleteCommunity,
};
