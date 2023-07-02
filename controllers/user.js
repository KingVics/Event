const User = require('../models/user');
const Community = require('../models/community');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../errors');
const { StatusCodes } = require('http-status-codes');
const NotificationTokenSchema = require('../models/notification');

const getUsers = async (req, res) => {
  const { name, email } = req.query;

  let queryObject = {};
  if (email) {
    queryObject.email = email;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: 'i' };
  }

  let result = User.find(queryObject);

  if (!result) {
    result = User.find({});
  }

  const user = await result;

  if (!user.length > 0) {
    throw new NotFoundError(`No user found`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
  const { community } = req.body;

  if (!community) {
    throw new BadRequestError('Please provide community reference code');
  }

  const findCommunity = await Community.findOne({ referenceCode: community });

  if (!findCommunity || findCommunity === null) {
    throw new NotFoundError(`No community found`);
  }

  const user = await User.findById(req.user.userId);

  if (user && user.community) {
    throw new BadRequestError('User already belong to a community');
  }
  await NotificationTokenSchema.updateOne(
    {
      userId: req.user.userId,
    },
    { community: findCommunity._id },
    { new: true }
  );
  await User.findByIdAndUpdate(req.user.userId, {
    community: findCommunity._id,
  });
  res.status(StatusCodes.OK).json({ message: 'Record updated' });
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (user === null) {
    throw new NotFoundError('No user found');
  }

  if (user && user.community) {
    throw new BadRequestError('Remove community before deleting user');
  }

  await User.findByIdAndDelete(req.user.userId);

  res.status(StatusCodes.OK).json({ message: 'User deleted' });
};

const removeCommunity = async (req, res) => {
  const finduser = await User.findById(req.user.userId);

  if (finduser === null) {
    throw new NotFoundError('No user found');
  }

  if (!finduser.community) {
    throw new BadRequestError('No community found for this user');
  }

  await NotificationTokenSchema.updateOne(
    {
      userId: req.user.userId,
    },
    { $unset: { community: '' } }
  );

  await User.updateOne(
    { _id: req.user.userId },
    { $unset: { community: ' ' } }
  );

  res.status(StatusCodes.OK).json({ message: 'Community removed' });
};

const LogoutUser = async (req, res) => {
  const cookie = req?.cookies?.jwt;
  if (!cookie) {
    throw new UnauthenticatedError('Unauthorized access');
  }

  const user = await User.findOneAndUpdate(
    { refreshToken: cookie },
    { refreshToken: '' },
    { new: true }
  );

  if (!user) {
    res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    throw new NotFoundError('User not found');
  }

  await NotificationTokenSchema.findOneAndDelete({
    userId: req.user.userId,
  });

  res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  res.status(StatusCodes.OK).json({ message: 'Logout successfully' });
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  removeCommunity,
  LogoutUser,
};
